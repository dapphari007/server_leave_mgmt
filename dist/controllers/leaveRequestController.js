"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelLeaveRequest = exports.updateLeaveRequestStatus = exports.getManagerLeaveRequests = exports.getUserLeaveRequests = exports.getLeaveRequestById = exports.getAllLeaveRequests = exports.createLeaveRequest = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const dateUtils_1 = require("../utils/dateUtils");
const emailService_1 = __importDefault(require("../utils/emailService"));
const logger_1 = __importDefault(require("../utils/logger"));
const typeorm_1 = require("typeorm");
const createLeaveRequest = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;
        const { leaveTypeId, startDate, endDate, requestType, reason } = request.payload;
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
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
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
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }
        // Check if leave type is applicable for the user's gender
        if (leaveType.applicableGender &&
            user.gender !== leaveType.applicableGender) {
            return h
                .response({
                message: `This leave type is only applicable for ${leaveType.applicableGender} employees`,
            })
                .code(400);
        }
        // Check if half-day is allowed for this leave type
        if (requestType &&
            requestType !== models_1.LeaveRequestType.FULL_DAY &&
            !leaveType.isHalfDayAllowed) {
            return h
                .response({
                message: "Half-day leave is not allowed for this leave type",
            })
                .code(400);
        }
        // Calculate number of days
        let numberOfDays = await (0, dateUtils_1.calculateBusinessDays)(start, end);
        // Adjust for half-day if applicable
        if (requestType && requestType !== models_1.LeaveRequestType.FULL_DAY) {
            if (start.getTime() !== end.getTime()) {
                return h
                    .response({
                    message: "Half-day leave can only be applied for a single day",
                })
                    .code(400);
            }
            numberOfDays = (0, dateUtils_1.calculateHalfDayValue)(true);
        }
        // Check if there are overlapping leave requests
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        const overlappingLeaveRequests = await leaveRequestRepository.find({
            where: [
                {
                    userId: userId,
                    status: models_1.LeaveRequestStatus.PENDING,
                    startDate: (0, typeorm_1.LessThanOrEqual)(end),
                    endDate: (0, typeorm_1.MoreThanOrEqual)(start),
                },
                {
                    userId: userId,
                    status: models_1.LeaveRequestStatus.APPROVED,
                    startDate: (0, typeorm_1.LessThanOrEqual)(end),
                    endDate: (0, typeorm_1.MoreThanOrEqual)(start),
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
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const leaveBalance = await leaveBalanceRepository.findOne({
            where: {
                userId: userId,
                leaveTypeId: leaveTypeId,
                year: (0, dateUtils_1.getCurrentYear)(),
            },
        });
        if (!leaveBalance) {
            return h
                .response({ message: "No leave balance found for this leave type" })
                .code(404);
        }
        const availableBalance = leaveBalance.balance + leaveBalance.carryForward - leaveBalance.used;
        if (numberOfDays > availableBalance) {
            return h
                .response({
                message: `Insufficient leave balance. Available: ${availableBalance}, Requested: ${numberOfDays}`,
            })
                .code(400);
        }
        // Create new leave request
        const leaveRequest = new models_1.LeaveRequest();
        leaveRequest.userId = userId;
        leaveRequest.leaveTypeId = leaveTypeId;
        leaveRequest.startDate = start;
        leaveRequest.endDate = end;
        leaveRequest.requestType = requestType || models_1.LeaveRequestType.FULL_DAY;
        leaveRequest.numberOfDays = numberOfDays;
        leaveRequest.reason = reason;
        leaveRequest.status = models_1.LeaveRequestStatus.PENDING;
        // Save leave request to database
        const savedLeaveRequest = await leaveRequestRepository.save(leaveRequest);
        // Find manager to notify
        if (user.managerId) {
            const manager = await userRepository.findOne({
                where: { id: user.managerId },
            });
            if (manager) {
                // Send email notification to manager
                await emailService_1.default.sendLeaveRequestNotification(manager.email, `${user.firstName} ${user.lastName}`, leaveType.name, (0, dateUtils_1.formatDate)(start), (0, dateUtils_1.formatDate)(end), reason);
            }
        }
        return h
            .response({
            message: "Leave request created successfully",
            leaveRequest: savedLeaveRequest,
        })
            .code(201);
    }
    catch (error) {
        logger_1.default.error(`Error in createLeaveRequest: ${error}`);
        return h
            .response({
            message: "An error occurred while creating the leave request",
        })
            .code(500);
    }
};
exports.createLeaveRequest = createLeaveRequest;
const getAllLeaveRequests = async (request, h) => {
    try {
        const { userId, leaveTypeId, status, startDate, endDate } = request.query;
        // Build query
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        let query = {};
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
            query.startDate = (0, typeorm_1.MoreThanOrEqual)(new Date(startDate));
            query.endDate = (0, typeorm_1.LessThanOrEqual)(new Date(endDate));
        }
        else if (startDate) {
            query.startDate = (0, typeorm_1.MoreThanOrEqual)(new Date(startDate));
        }
        else if (endDate) {
            query.endDate = (0, typeorm_1.LessThanOrEqual)(new Date(endDate));
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
    }
    catch (error) {
        logger_1.default.error(`Error in getAllLeaveRequests: ${error}`);
        return h
            .response({ message: "An error occurred while fetching leave requests" })
            .code(500);
    }
};
exports.getAllLeaveRequests = getAllLeaveRequests;
const getLeaveRequestById = async (request, h) => {
    try {
        const { id } = request.params;
        // Get leave request
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
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
    }
    catch (error) {
        logger_1.default.error(`Error in getLeaveRequestById: ${error}`);
        return h
            .response({
            message: "An error occurred while fetching the leave request",
        })
            .code(500);
    }
};
exports.getLeaveRequestById = getLeaveRequestById;
const getUserLeaveRequests = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;
        const { status, year } = request.query;
        // Build query
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        let query = { userId };
        if (status) {
            query.status = status;
        }
        if (year) {
            const startOfYear = new Date(parseInt(year), 0, 1);
            const endOfYear = new Date(parseInt(year), 11, 31);
            query.startDate = (0, typeorm_1.MoreThanOrEqual)(startOfYear);
            query.endDate = (0, typeorm_1.LessThanOrEqual)(endOfYear);
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
    }
    catch (error) {
        logger_1.default.error(`Error in getUserLeaveRequests: ${error}`);
        return h
            .response({ message: "An error occurred while fetching leave requests" })
            .code(500);
    }
};
exports.getUserLeaveRequests = getUserLeaveRequests;
const getManagerLeaveRequests = async (request, h) => {
    try {
        const managerId = request.auth.credentials.id;
        const { status } = request.query;
        // Get all users managed by this manager
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const managedUsers = await userRepository.find({
            where: { managerId: managerId },
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
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        let query = { userId: (0, typeorm_1.In)(managedUserIds) };
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
    }
    catch (error) {
        logger_1.default.error(`Error in getManagerLeaveRequests: ${error}`);
        return h
            .response({ message: "An error occurred while fetching leave requests" })
            .code(500);
    }
};
exports.getManagerLeaveRequests = getManagerLeaveRequests;
const updateLeaveRequestStatus = async (request, h) => {
    try {
        const { id } = request.params;
        const { status, comments } = request.payload;
        const approverId = request.auth.credentials.id;
        // Validate input
        if (!status) {
            return h.response({ message: "Status is required" }).code(400);
        }
        if (!Object.values(models_1.LeaveRequestStatus).includes(status)) {
            return h.response({ message: "Invalid status" }).code(400);
        }
        // Get leave request
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
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
        if (leaveRequest.status !== models_1.LeaveRequestStatus.PENDING &&
            status !== models_1.LeaveRequestStatus.CANCELLED) {
            return h
                .response({
                message: "Only pending leave requests can be approved or rejected",
            })
                .code(400);
        }
        // Check if the user is authorized to update the status
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const approver = await userRepository.findOne({
            where: { id: approverId },
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
        const isAdminOrHR = approver.role === "super_admin" || approver.role === "hr";
        const isSelfCancellation = leaveRequest.userId === approverId &&
            status === models_1.LeaveRequestStatus.CANCELLED;
        if (!isManager && !isAdminOrHR && !isSelfCancellation) {
            return h
                .response({
                message: "You are not authorized to update this leave request",
            })
                .code(403);
        }
        // Check if multi-level approval is required
        if (status === models_1.LeaveRequestStatus.APPROVED) {
            const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
            const approvalWorkflows = await approvalWorkflowRepository.find({
                where: { isActive: true },
                order: { minDays: "DESC" },
            });
            const applicableWorkflow = approvalWorkflows.find((workflow) => leaveRequest.numberOfDays >= workflow.minDays &&
                leaveRequest.numberOfDays <= workflow.maxDays);
            if (applicableWorkflow) {
                // Parse the approvalLevels JSON string into an array
                const approvalLevels = JSON.parse(applicableWorkflow.approvalLevels);
                // Check if the approver has the required level
                const requiredLevel = approvalLevels.find((level) => level.roles.includes(approver.role));
                if (!requiredLevel) {
                    return h
                        .response({
                        message: "You do not have the required role to approve this leave request",
                    })
                        .code(403);
                }
            }
        }
        // Update leave request status
        leaveRequest.status = status;
        leaveRequest.approverComments = comments || null;
        leaveRequest.approverId = approverId;
        leaveRequest.approvedAt = new Date();
        // Save updated leave request
        const updatedLeaveRequest = await leaveRequestRepository.save(leaveRequest);
        // Update leave balance if approved
        if (status === models_1.LeaveRequestStatus.APPROVED) {
            const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
            const leaveBalance = await leaveBalanceRepository.findOne({
                where: {
                    userId: leaveRequest.userId,
                    leaveTypeId: leaveRequest.leaveTypeId,
                    year: (0, dateUtils_1.getCurrentYear)(),
                },
            });
            if (leaveBalance) {
                leaveBalance.used += leaveRequest.numberOfDays;
                await leaveBalanceRepository.save(leaveBalance);
            }
        }
        // Send email notification to the user
        if (leaveRequest.user && leaveRequest.leaveType) {
            await emailService_1.default.sendLeaveStatusUpdateNotification(leaveRequest.user.email, leaveRequest.leaveType.name, (0, dateUtils_1.formatDate)(leaveRequest.startDate), (0, dateUtils_1.formatDate)(leaveRequest.endDate), status, comments);
        }
        return h
            .response({
            message: `Leave request ${status} successfully`,
            leaveRequest: updatedLeaveRequest,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in updateLeaveRequestStatus: ${error}`);
        return h
            .response({
            message: "An error occurred while updating the leave request status",
        })
            .code(500);
    }
};
exports.updateLeaveRequestStatus = updateLeaveRequestStatus;
const cancelLeaveRequest = async (request, h) => {
    try {
        const { id } = request.params;
        const userId = request.auth.credentials.id;
        // Get leave request
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
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
        if (leaveRequest.status === models_1.LeaveRequestStatus.CANCELLED) {
            return h
                .response({ message: "Leave request is already cancelled" })
                .code(400);
        }
        // Check if leave request is already approved and the start date is in the past
        if (leaveRequest.status === models_1.LeaveRequestStatus.APPROVED) {
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
            const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
            const leaveBalance = await leaveBalanceRepository.findOne({
                where: {
                    userId: leaveRequest.userId,
                    leaveTypeId: leaveRequest.leaveTypeId,
                    year: (0, dateUtils_1.getCurrentYear)(),
                },
            });
            if (leaveBalance) {
                leaveBalance.used -= leaveRequest.numberOfDays;
                await leaveBalanceRepository.save(leaveBalance);
            }
        }
        // Update leave request status
        leaveRequest.status = models_1.LeaveRequestStatus.CANCELLED;
        // Save updated leave request
        const updatedLeaveRequest = await leaveRequestRepository.save(leaveRequest);
        // Send email notification to the manager if exists
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (user && user.managerId) {
            const manager = await userRepository.findOne({
                where: { id: user.managerId },
            });
            if (manager && leaveRequest.leaveType) {
                await emailService_1.default.sendLeaveStatusUpdateNotification(manager.email, leaveRequest.leaveType.name, (0, dateUtils_1.formatDate)(leaveRequest.startDate), (0, dateUtils_1.formatDate)(leaveRequest.endDate), models_1.LeaveRequestStatus.CANCELLED, "Cancelled by employee");
            }
        }
        return h
            .response({
            message: "Leave request cancelled successfully",
            leaveRequest: updatedLeaveRequest,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in cancelLeaveRequest: ${error}`);
        return h
            .response({
            message: "An error occurred while cancelling the leave request",
        })
            .code(500);
    }
};
exports.cancelLeaveRequest = cancelLeaveRequest;
//# sourceMappingURL=leaveRequestController.js.map