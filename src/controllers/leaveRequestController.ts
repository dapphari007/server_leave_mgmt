import { Request, ResponseToolkit } from "@hapi/hapi";
import { AppDataSource } from "../config/database";
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveRequestType,
  User,
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

    // Find manager to notify
    if (user.managerId) {
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
    const managerId = request.auth.credentials.id;
    const { status } = request.query as any;

    // Get all users managed by this manager
    const userRepository = AppDataSource.getRepository(User);
    const managedUsers = await userRepository.find({
      where: { managerId: managerId as string },
    });

    if (managedUsers.length === 0) {
      return h
        .response({
          leaveRequests: [],
          count: 0,
        })
        .code(200);
    }

    const managedUserIds = managedUsers.map((user) => user.id);

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
    const { id } = request.params;
    const { status, comments } = request.payload as any;
    const approverId = request.auth.credentials.id;

    // Validate input
    if (!status) {
      return h.response({ message: "Status is required" }).code(400);
    }

    if (!Object.values(LeaveRequestStatus).includes(status)) {
      return h.response({ message: "Invalid status" }).code(400);
    }

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
    if (leaveRequest.status === status) {
      return h
        .response({ message: `Leave request is already ${status}` })
        .code(400);
    }

    // Check if leave request is pending
    if (
      leaveRequest.status !== LeaveRequestStatus.PENDING &&
      status !== LeaveRequestStatus.CANCELLED
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
      approver.role === "super_admin" || approver.role === "hr";
    const isSelfCancellation =
      leaveRequest.userId === approverId &&
      status === LeaveRequestStatus.CANCELLED;

    if (!isManager && !isAdminOrHR && !isSelfCancellation) {
      return h
        .response({
          message: "You are not authorized to update this leave request",
        })
        .code(403);
    }

    // Check if multi-level approval is required
    if (status === LeaveRequestStatus.APPROVED) {
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
        // Parse the approvalLevels JSON string into an array
        const approvalLevels = JSON.parse(applicableWorkflow.approvalLevels);

        // Check if the approver has the required level
        const requiredLevel = approvalLevels.find((level) =>
          level.roles.includes(approver.role)
        );

        if (!requiredLevel) {
          return h
            .response({
              message:
                "You do not have the required role to approve this leave request",
            })
            .code(403);
        }
      }
    }

    // Update leave request status
    leaveRequest.status = status;
    leaveRequest.approverComments = comments || null;
    leaveRequest.approverId = approverId as string;
    leaveRequest.approvedAt = new Date();

    // Save updated leave request
    const updatedLeaveRequest = await leaveRequestRepository.save(leaveRequest);

    // Update leave balance if approved
    if (status === LeaveRequestStatus.APPROVED) {
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
        status,
        comments
      );
    }

    return h
      .response({
        message: `Leave request ${status} successfully`,
        leaveRequest: updatedLeaveRequest,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in updateLeaveRequestStatus: ${error}`);
    return h
      .response({
        message: "An error occurred while updating the leave request status",
      })
      .code(500);
  }
};

export const cancelLeaveRequest = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
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
