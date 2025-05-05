import { Request, ResponseToolkit } from "@hapi/hapi";
import { AppDataSource, ensureDatabaseConnection } from "../config/database";
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveRequestType,
  User,
  UserRole,
  LeaveType,
  LeaveBalance,
  ApprovalWorkflow,
} from "../models";
import {
  calculateBusinessDays,
  calculateHalfDayValue,
  getCurrentYear,
  formatDate,
} from "../utils/dateUtils";
import emailService from "../utils/emailService";
import logger from "../utils/logger";
import { LessThanOrEqual, MoreThanOrEqual, In } from "typeorm";

export const createLeaveRequest = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    // Ensure database connection is established before proceeding
    await ensureDatabaseConnection();

    const userId = request.auth.credentials.id;
    const { leaveTypeId, startDate, endDate, requestType, reason } =
      request.payload as any;

    // Validate input
    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return h
        .response({
          message: "Leave type, start date, end date, and reason are required",
        })
        .code(400);
    }

    // Check if start date is before end date
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return h
        .response({ message: "Start date cannot be after end date" })
        .code(400);
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return h
        .response({
          message: "Cannot apply for leave with a start date in the past",
        })
        .code(400);
    }

    // Check if leave type exists
    const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
    const leaveType = await leaveTypeRepository.findOne({
      where: { id: leaveTypeId },
    });

    if (!leaveType) {
      return h.response({ message: "Leave type not found" }).code(404);
    }

    // Check if leave type is active
    if (!leaveType.isActive) {
      return h
        .response({ message: "This leave type is currently inactive" })
        .code(400);
    }

    // Get user
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId as string },
    });

    if (!user) {
      return h.response({ message: "User not found" }).code(404);
    }

    // Check if leave type is applicable for the user's gender
    if (
      leaveType.applicableGender &&
      user.gender !== leaveType.applicableGender
    ) {
      return h
        .response({
          message: `This leave type is only applicable for ${leaveType.applicableGender} employees`,
        })
        .code(400);
    }

    // Check if half-day is allowed for this leave type
    if (
      requestType &&
      requestType !== LeaveRequestType.FULL_DAY &&
      !leaveType.isHalfDayAllowed
    ) {
      return h
        .response({
          message: "Half-day leave is not allowed for this leave type",
        })
        .code(400);
    }

    // Calculate number of days
    let numberOfDays = await calculateBusinessDays(start, end);

    // Adjust for half-day if applicable
    if (requestType && requestType !== LeaveRequestType.FULL_DAY) {
      if (start.getTime() !== end.getTime()) {
        return h
          .response({
            message: "Half-day leave can only be applied for a single day",
          })
          .code(400);
      }
      numberOfDays = calculateHalfDayValue(true);
    }

    // Check if there are overlapping leave requests
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
    const overlappingLeaveRequests = await leaveRequestRepository.find({
      where: [
        {
          userId: userId as string,
          status: LeaveRequestStatus.PENDING,
          startDate: LessThanOrEqual(end),
          endDate: MoreThanOrEqual(start),
        },
        {
          userId: userId as string,
          status: LeaveRequestStatus.APPROVED,
          startDate: LessThanOrEqual(end),
          endDate: MoreThanOrEqual(start),
        },
      ],
    });

    if (overlappingLeaveRequests.length > 0) {
      return h
        .response({
          message: "You already have a leave request for this period",
        })
        .code(409);
    }

    // Check leave balance
    const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);
    const leaveBalance = await leaveBalanceRepository.findOne({
      where: {
        userId: userId as string,
        leaveTypeId: leaveTypeId as string,
        year: getCurrentYear(),
      },
    });

    if (!leaveBalance) {
      return h
        .response({ message: "No leave balance found for this leave type" })
        .code(404);
    }

    const availableBalance =
      leaveBalance.balance + leaveBalance.carryForward - leaveBalance.used;

    if (numberOfDays > availableBalance) {
      return h
        .response({
          message: `Insufficient leave balance. Available: ${availableBalance}, Requested: ${numberOfDays}`,
        })
        .code(400);
    }

    // Create new leave request
    const leaveRequest = new LeaveRequest();
    leaveRequest.userId = userId as string;
    leaveRequest.leaveTypeId = leaveTypeId as string;
    leaveRequest.startDate = start;
    leaveRequest.endDate = end;
    leaveRequest.requestType = requestType || LeaveRequestType.FULL_DAY;
    leaveRequest.numberOfDays = numberOfDays;
    leaveRequest.reason = reason;
    leaveRequest.status = LeaveRequestStatus.PENDING;

    // Save leave request to database
    const savedLeaveRequest = await leaveRequestRepository.save(leaveRequest);

    // Find manager or HR to notify
    // If user is super_admin, redirect to HR
    if (user.role === UserRole.SUPER_ADMIN) {
      // Find HR users to notify
      const hrUsers = await userRepository.find({
        where: { role: UserRole.HR, isActive: true },
      });

      if (hrUsers.length > 0) {
        // Notify all HR users
        for (const hrUser of hrUsers) {
          await emailService.sendLeaveRequestNotification(
            hrUser.email,
            `${user.firstName} ${user.lastName} (Super Admin)`,
            leaveType.name,
            formatDate(start),
            formatDate(end),
            reason
          );
        }
      }
    } else if (user.managerId) {
      // Regular flow - notify manager
      const manager = await userRepository.findOne({
        where: { id: user.managerId },
      });
      if (manager) {
        // Send email notification to manager
        await emailService.sendLeaveRequestNotification(
          manager.email,
          `${user.firstName} ${user.lastName}`,
          leaveType.name,
          formatDate(start),
          formatDate(end),
          reason
        );
      }
    }

    return h
      .response({
        message: "Leave request created successfully",
        leaveRequest: savedLeaveRequest,
      })
      .code(201);
  } catch (error) {
    logger.error(`Error in createLeaveRequest: ${error}`);
    return h
      .response({
        message: "An error occurred while creating the leave request",
      })
      .code(500);
  }
};

export const getAllLeaveRequests = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    // Ensure database connection is established before proceeding
    await ensureDatabaseConnection();

    const { userId, leaveTypeId, status, startDate, endDate } =
      request.query as any;

    // Build query
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
    let query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (leaveTypeId) {
      query.leaveTypeId = leaveTypeId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.startDate = MoreThanOrEqual(new Date(startDate));
      query.endDate = LessThanOrEqual(new Date(endDate));
    } else if (startDate) {
      query.startDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      query.endDate = LessThanOrEqual(new Date(endDate));
    }

    // Get leave requests with relations
    const leaveRequests = await leaveRequestRepository.find({
      where: query,
      relations: ["user", "leaveType", "approver"],
      order: {
        createdAt: "DESC",
      },
    });

    return h
      .response({
        leaveRequests,
        count: leaveRequests.length,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in getAllLeaveRequests: ${error}`);
    return h
      .response({ message: "An error occurred while fetching leave requests" })
      .code(500);
  }
};

export const getLeaveRequestById = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    // Ensure database connection is established before proceeding
    await ensureDatabaseConnection();

    const { id } = request.params;

    // Get leave request
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
    const leaveRequest = await leaveRequestRepository.findOne({
      where: { id },
      relations: ["user", "leaveType", "approver"],
    });

    if (!leaveRequest) {
      return h.response({ message: "Leave request not found" }).code(404);
    }

    return h
      .response({
        leaveRequest,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in getLeaveRequestById: ${error}`);
    return h
      .response({
        message: "An error occurred while fetching the leave request",
      })
      .code(500);
  }
};

export const getUserLeaveRequests = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    // Ensure database connection is established before proceeding
    await ensureDatabaseConnection();

    const userId = request.auth.credentials.id;
    const { status, year } = request.query as any;

    // Build query
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
    let query: any = { userId };

    if (status) {
      query.status = status;
    }

    if (year) {
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year), 11, 31);
      query.startDate = MoreThanOrEqual(startOfYear);
      query.endDate = LessThanOrEqual(endOfYear);
    }

    // Get leave requests
    const leaveRequests = await leaveRequestRepository.find({
      where: query,
      relations: ["leaveType", "approver"],
      order: {
        createdAt: "DESC",
      },
    });

    return h
      .response({
        leaveRequests,
        count: leaveRequests.length,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in getUserLeaveRequests: ${error}`);
    return h
      .response({ message: "An error occurred while fetching leave requests" })
      .code(500);
  }
};

export const getManagerLeaveRequests = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    // Ensure database connection is established before proceeding
    await ensureDatabaseConnection();

    const userId = request.auth.credentials.id;
    const userRole = request.auth.credentials.role;
    const { status } = request.query as any;

    // If user is a regular employee, return their own leave requests
    if (userRole === UserRole.EMPLOYEE) {
      return getUserLeaveRequests(request, h);
    }

    const userRepository = AppDataSource.getRepository(User);
    let managedUserIds: string[] = [];

    // For HR and admins, get all users' leave requests
    if (userRole === UserRole.HR || userRole === UserRole.SUPER_ADMIN) {
      const allUsers = await userRepository.find();
      managedUserIds = allUsers.map((user) => user.id);
    }
    // For managers and team leads, get only their team members
    else {
      // Get all users managed by this manager/team lead
      const managedUsers = await userRepository.find({
        where: { managerId: userId as string },
      });

      if (managedUsers.length === 0) {
        return h
          .response({
            leaveRequests: [],
            count: 0,
          })
          .code(200);
      }

      managedUserIds = managedUsers.map((user) => user.id);
    }

    // Build query
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
    let query: any = { userId: In(managedUserIds) };

    if (status) {
      query.status = status;
    }

    // Get leave requests
    const leaveRequests = await leaveRequestRepository.find({
      where: query,
      relations: ["user", "leaveType"],
      order: {
        createdAt: "DESC",
      },
    });

    return h
      .response({
        leaveRequests,
        count: leaveRequests.length,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in getManagerLeaveRequests: ${error}`);
    return h
      .response({ message: "An error occurred while fetching leave requests" })
      .code(500);
  }
};

export const updateLeaveRequestStatus = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    // Ensure database connection is established before proceeding
    await ensureDatabaseConnection();

    const { id } = request.params;
    const { status, comments } = request.payload as any;
    const approverId = request.auth.credentials.id;

    // Validate input
    if (!status) {
      return h.response({ message: "Status is required" }).code(400);
    }

    // Normalize status to ensure it matches the enum values
    const normalizedStatus = status.toLowerCase() as LeaveRequestStatus;

    // Check if the status is valid
    if (!Object.values(LeaveRequestStatus).includes(normalizedStatus)) {
      logger.error(
        `Invalid status: ${status}, normalized: ${normalizedStatus}`
      );
      return h
        .response({
          message: "Invalid status",
          validValues: Object.values(LeaveRequestStatus),
        })
        .code(400);
    }

    // We'll use normalizedStatus instead of status from here on

    // Get leave request
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
    const leaveRequest = await leaveRequestRepository.findOne({
      where: { id },
      relations: ["user", "leaveType"],
    });

    if (!leaveRequest) {
      return h.response({ message: "Leave request not found" }).code(404);
    }

    // Check if leave request is already in the requested status
    if (leaveRequest.status === normalizedStatus) {
      return h
        .response({ message: `Leave request is already ${normalizedStatus}` })
        .code(400);
    }

    // Check if leave request is pending
    if (
      leaveRequest.status !== LeaveRequestStatus.PENDING &&
      normalizedStatus !== LeaveRequestStatus.CANCELLED
    ) {
      return h
        .response({
          message: "Only pending leave requests can be approved or rejected",
        })
        .code(400);
    }

    // Check if the user is authorized to update the status
    const userRepository = AppDataSource.getRepository(User);
    const approver = await userRepository.findOne({
      where: { id: approverId as string },
    });

    if (!approver) {
      return h.response({ message: "Approver not found" }).code(404);
    }

    // Only the manager of the user or an admin/HR can approve/reject
    const requestUser = await userRepository.findOne({
      where: { id: leaveRequest.userId },
    });

    if (!requestUser) {
      return h.response({ message: "User not found" }).code(404);
    }

    const isManager = requestUser.managerId === approverId;
    const isAdminOrHR =
      approver.role === UserRole.SUPER_ADMIN || approver.role === UserRole.HR;
    const isSelfCancellation =
      leaveRequest.userId === approverId &&
      normalizedStatus === LeaveRequestStatus.CANCELLED;

    if (!isManager && !isAdminOrHR && !isSelfCancellation) {
      return h
        .response({
          message: "You are not authorized to update this leave request",
        })
        .code(403);
    }

    // Check if multi-level approval is required
    if (normalizedStatus === LeaveRequestStatus.APPROVED) {
      const approvalWorkflowRepository =
        AppDataSource.getRepository(ApprovalWorkflow);
      const approvalWorkflows = await approvalWorkflowRepository.find({
        where: { isActive: true },
        order: { minDays: "DESC" },
      });

      const applicableWorkflow = approvalWorkflows.find(
        (workflow) =>
          leaveRequest.numberOfDays >= workflow.minDays &&
          leaveRequest.numberOfDays <= workflow.maxDays
      );

      if (applicableWorkflow) {
        // Handle approvalLevels which might be a string or an object
        let approvalLevels = applicableWorkflow.approvalLevels;

        // Parse the approvalLevels if it's a string
        if (typeof approvalLevels === "string") {
          try {
            approvalLevels = JSON.parse(approvalLevels);
            // Handle the case where it might be double-stringified
            if (typeof approvalLevels === "string") {
              approvalLevels = JSON.parse(approvalLevels);
            }
          } catch (error) {
            logger.error(`Error parsing approvalLevels: ${error}`);
            return h
              .response({
                message: "An error occurred while processing approval workflow",
              })
              .code(500);
          }
        }

        // Check if approvalLevels is an array before using find method
        if (!Array.isArray(approvalLevels)) {
          logger.error(
            `Error: approvalLevels is not an array: ${JSON.stringify(
              approvalLevels
            )}`
          );
          return h
            .response({
              message: "An error occurred while processing approval workflow",
            })
            .code(500);
        }

        // Sort approval levels by level number to ensure proper hierarchy
        const sortedLevels = [...approvalLevels].sort(
          (a, b) => a.level - b.level
        );

        // Find the current approver's level
        let currentApproverLevel = null;
        for (const level of sortedLevels) {
          const roles = Array.isArray(level.roles)
            ? level.roles
            : [level.roles];
          if (roles.includes(approver.role)) {
            currentApproverLevel = level.level;
            break;
          }
        }

        if (currentApproverLevel === null) {
          return h
            .response({
              message:
                "You do not have the required role to approve this leave request",
            })
            .code(403);
        }

        // Check if this is the highest level required for this leave request
        const highestRequiredLevel =
          sortedLevels[sortedLevels.length - 1].level;

        // If this is not the highest level required, mark as "pending_next_approval" instead of fully approved
        if (currentApproverLevel < highestRequiredLevel) {
          // Store the current approval level in the comments for tracking
          const currentApprovalComment = `Approved at level ${currentApproverLevel} by ${approver.firstName} ${approver.lastName}`;
          const existingComments = leaveRequest.approverComments || "";

          leaveRequest.approverComments = existingComments
            ? `${existingComments}\n${currentApprovalComment}`
            : currentApprovalComment;

          if (comments) {
            leaveRequest.approverComments += `\nComments: ${comments}`;
          }

          // Update status to PARTIALLY_APPROVED
          leaveRequest.status = LeaveRequestStatus.PARTIALLY_APPROVED;
          leaveRequest.approverId = approverId as string;

          // Add metadata about the current approval level
          const metadata = leaveRequest.metadata || {};
          metadata.currentApprovalLevel = currentApproverLevel;
          metadata.requiredApprovalLevels = sortedLevels.map((l) => l.level);

          // Add to approval history
          if (!metadata.approvalHistory) {
            metadata.approvalHistory = [];
          }

          metadata.approvalHistory.push({
            level: currentApproverLevel,
            approverId: approverId as string,
            approverName: `${approver.firstName} ${approver.lastName}`,
            approvedAt: new Date(),
            comments: comments || undefined,
          });

          leaveRequest.metadata = metadata;

          // Save the updated leave request
          const updatedLeaveRequest = await leaveRequestRepository.save(
            leaveRequest
          );

          // Find the next approver(s) based on the next level
          const nextLevel = sortedLevels.find(
            (l) => l.level === currentApproverLevel + 1
          );
          if (nextLevel) {
            const nextRoles = Array.isArray(nextLevel.roles)
              ? nextLevel.roles
              : [nextLevel.roles];

            // Notify the next level approvers
            const potentialApprovers = await userRepository.find({
              where: { role: In(nextRoles), isActive: true },
            });

            if (potentialApprovers.length > 0) {
              for (const nextApprover of potentialApprovers) {
                // Send notification to the next approver
                await emailService.sendLeaveRequestNotification(
                  nextApprover.email,
                  `${requestUser.firstName} ${requestUser.lastName}`,
                  leaveRequest.leaveType.name,
                  formatDate(leaveRequest.startDate),
                  formatDate(leaveRequest.endDate),
                  `${
                    leaveRequest.reason
                  }\n\nThis request has been approved at L-${currentApproverLevel} and requires your approval at L-${
                    currentApproverLevel + 1
                  }.`
                );
              }
            }
          }

          // Notify the employee about partial approval
          if (leaveRequest.user && leaveRequest.leaveType) {
            await emailService.sendLeaveStatusUpdateNotification(
              leaveRequest.user.email,
              leaveRequest.leaveType.name,
              formatDate(leaveRequest.startDate),
              formatDate(leaveRequest.endDate),
              LeaveRequestStatus.PARTIALLY_APPROVED,
              `Your leave request has been approved at L-${currentApproverLevel} by ${approver.firstName} ${approver.lastName} and is awaiting further approval.`
            );
          }

          return h
            .response({
              message: `Leave request approved at L-${currentApproverLevel}, pending higher level approval`,
              leaveRequest: updatedLeaveRequest,
            })
            .code(200);
        }

        // If we reach here, this is the highest level approval needed, so fully approve
        // Add to approval history
        const metadata = leaveRequest.metadata || {};
        if (!metadata.approvalHistory) {
          metadata.approvalHistory = [];
        }

        metadata.approvalHistory.push({
          level: currentApproverLevel,
          approverId: approverId as string,
          approverName: `${approver.firstName} ${approver.lastName}`,
          approvedAt: new Date(),
          comments: comments || undefined,
        });

        metadata.isFullyApproved = true;
        leaveRequest.metadata = metadata;
      }
    }

    // Update leave request status
    leaveRequest.status = normalizedStatus;

    // Store comments in the database
    if (comments) {
      leaveRequest.approverComments = comments;
    }

    leaveRequest.approverId = approverId as string;
    leaveRequest.approvedAt = new Date();

    // If this is a final approval after partial approvals, update the metadata
    if (
      normalizedStatus === LeaveRequestStatus.APPROVED &&
      leaveRequest.metadata
    ) {
      const metadata = leaveRequest.metadata;

      // Add to approval history if it exists
      if (metadata.approvalHistory) {
        metadata.approvalHistory.push({
          level: metadata.currentApprovalLevel
            ? metadata.currentApprovalLevel + 1
            : 1,
          approverId: approverId as string,
          approverName: `${approver.firstName} ${approver.lastName}`,
          approvedAt: new Date(),
          comments: comments || undefined,
        });

        // Mark as fully approved
        metadata.isFullyApproved = true;
        leaveRequest.metadata = metadata;
      }
    }

    // Save updated leave request
    const updatedLeaveRequest = await leaveRequestRepository.save(leaveRequest);

    // Update leave balance if approved
    if (normalizedStatus === LeaveRequestStatus.APPROVED) {
      const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);
      const leaveBalance = await leaveBalanceRepository.findOne({
        where: {
          userId: leaveRequest.userId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year: getCurrentYear(),
        },
      });

      if (leaveBalance) {
        leaveBalance.used += leaveRequest.numberOfDays;
        await leaveBalanceRepository.save(leaveBalance);
      }
    }

    // Send email notification to the user
    if (leaveRequest.user && leaveRequest.leaveType) {
      await emailService.sendLeaveStatusUpdateNotification(
        leaveRequest.user.email,
        leaveRequest.leaveType.name,
        formatDate(leaveRequest.startDate),
        formatDate(leaveRequest.endDate),
        normalizedStatus,
        comments
      );
    }

    return h
      .response({
        message: `Leave request ${normalizedStatus} successfully`,
        leaveRequest: updatedLeaveRequest,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in updateLeaveRequestStatus: ${error}`);
    logger.error(`Error details: ${JSON.stringify(error)}`);
    logger.error(`Request payload: ${JSON.stringify(request.payload)}`);
    logger.error(`Request params: ${JSON.stringify(request.params)}`);

    return h
      .response({
        message: "An error occurred while updating the leave request status",
        error: error.message,
      })
      .code(500);
  }
};

export const cancelLeaveRequest = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    // Ensure database connection is established before proceeding
    await ensureDatabaseConnection();

    const { id } = request.params;
    const userId = request.auth.credentials.id;

    // Get leave request
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
    const leaveRequest = await leaveRequestRepository.findOne({
      where: { id },
      relations: ["user", "leaveType"],
    });

    if (!leaveRequest) {
      return h.response({ message: "Leave request not found" }).code(404);
    }

    // Check if the user is the owner of the leave request
    if (leaveRequest.userId !== userId) {
      return h
        .response({ message: "You can only cancel your own leave requests" })
        .code(403);
    }

    // Check if leave request is already cancelled
    if (leaveRequest.status === LeaveRequestStatus.CANCELLED) {
      return h
        .response({ message: "Leave request is already cancelled" })
        .code(400);
    }

    // Check if leave request is already approved and the start date is in the past
    if (leaveRequest.status === LeaveRequestStatus.APPROVED) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (new Date(leaveRequest.startDate) < today) {
        return h
          .response({
            message: "Cannot cancel an approved leave that has already started",
          })
          .code(400);
      }

      // Update leave balance
      const leaveBalanceRepository = AppDataSource.getRepository(LeaveBalance);
      const leaveBalance = await leaveBalanceRepository.findOne({
        where: {
          userId: leaveRequest.userId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year: getCurrentYear(),
        },
      });

      if (leaveBalance) {
        leaveBalance.used -= leaveRequest.numberOfDays;
        await leaveBalanceRepository.save(leaveBalance);
      }
    }

    // Update leave request status
    leaveRequest.status = LeaveRequestStatus.CANCELLED;

    // Save updated leave request
    const updatedLeaveRequest = await leaveRequestRepository.save(leaveRequest);

    // Send email notification to the manager if exists
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (user && user.managerId) {
      const manager = await userRepository.findOne({
        where: { id: user.managerId },
      });
      if (manager && leaveRequest.leaveType) {
        await emailService.sendLeaveStatusUpdateNotification(
          manager.email,
          leaveRequest.leaveType.name,
          formatDate(leaveRequest.startDate),
          formatDate(leaveRequest.endDate),
          LeaveRequestStatus.CANCELLED,
          "Cancelled by employee"
        );
      }
    }

    return h
      .response({
        message: "Leave request cancelled successfully",
        leaveRequest: updatedLeaveRequest,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in cancelLeaveRequest: ${error}`);
    return h
      .response({
        message: "An error occurred while cancelling the leave request",
      })
      .code(500);
  }
};
