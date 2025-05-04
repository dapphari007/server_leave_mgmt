"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovalWorkflow = exports.cancelLeaveRequest = exports.updateLeaveRequestStatus = exports.getManagerLeaveRequests = exports.getUserLeaveRequests = exports.getLeaveRequestById = exports.getAllLeaveRequests = exports.createLeaveRequest = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const dateUtils_1 = require("../utils/dateUtils");
const emailService_1 = __importDefault(require("../utils/emailService"));
const logger_1 = __importDefault(require("../utils/logger"));
const typeorm_1 = require("typeorm");
/**
 * Create a new leave request
 */
const createLeaveRequest = async (userId, leaveRequestData) => {
    try {
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Get user
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ["manager"],
        });
        if (!user) {
            throw new Error("User not found");
        }
        // Get leave type
        const leaveType = await leaveTypeRepository.findOne({
            where: { id: leaveRequestData.leaveTypeId },
        });
        if (!leaveType) {
            throw new Error("Leave type not found");
        }
        // Check if leave type is applicable for user's gender
        if (leaveType.applicableGender &&
            user.gender !== leaveType.applicableGender) {
            throw new Error(`This leave type is only applicable for ${leaveType.applicableGender} employees`);
        }
        // Check if half-day is allowed for this leave type
        if ((leaveRequestData.requestType === models_1.LeaveRequestType.HALF_DAY_MORNING ||
            leaveRequestData.requestType === models_1.LeaveRequestType.HALF_DAY_AFTERNOON) &&
            !leaveType.isHalfDayAllowed) {
            throw new Error("Half-day leave is not allowed for this leave type");
        }
        // Calculate number of days
        const startDate = new Date(leaveRequestData.startDate);
        const endDate = new Date(leaveRequestData.endDate);
        if (startDate > endDate) {
            throw new Error("Start date cannot be after end date");
        }
        let numberOfDays;
        // Adjust for half-day
        if (leaveRequestData.requestType === models_1.LeaveRequestType.HALF_DAY_MORNING ||
            leaveRequestData.requestType === models_1.LeaveRequestType.HALF_DAY_AFTERNOON) {
            if (startDate.getTime() !== endDate.getTime()) {
                throw new Error("Start date and end date must be the same for half-day leave");
            }
            numberOfDays = 0.5;
        }
        else {
            // Calculate business days for full day requests
            numberOfDays = await (0, dateUtils_1.calculateBusinessDays)(startDate, endDate);
        }
        if (numberOfDays <= 0) {
            throw new Error("Invalid date range");
        }
        // Check for overlapping leave requests
        const overlappingRequests = await leaveRequestRepository.find({
            where: {
                userId,
                status: models_1.LeaveRequestStatus.APPROVED,
                startDate: (0, typeorm_1.LessThanOrEqual)(endDate),
                endDate: (0, typeorm_1.MoreThanOrEqual)(startDate),
            },
        });
        if (overlappingRequests.length > 0) {
            throw new Error("You already have an approved leave request for this period");
        }
        // Get leave balance for current year
        const currentYear = new Date().getFullYear();
        let leaveBalance = await leaveBalanceRepository.findOne({
            where: {
                userId,
                leaveTypeId: leaveType.id,
                year: currentYear,
            },
        });
        if (!leaveBalance) {
            // Create leave balance if it doesn't exist
            leaveBalance = new models_1.LeaveBalance();
            leaveBalance.userId = userId;
            leaveBalance.leaveTypeId = leaveType.id;
            leaveBalance.balance = leaveType.defaultDays;
            leaveBalance.used = 0;
            leaveBalance.carryForward = 0;
            leaveBalance.year = currentYear;
            leaveBalance = await leaveBalanceRepository.save(leaveBalance);
        }
        // Check if user has enough leave balance
        const availableBalance = leaveBalance.balance + leaveBalance.carryForward - leaveBalance.used;
        if (numberOfDays > availableBalance && leaveType.isPaidLeave) {
            throw new Error(`Insufficient leave balance. Available: ${availableBalance} days, Requested: ${numberOfDays} days`);
        }
        // Create leave request
        const leaveRequest = new models_1.LeaveRequest();
        leaveRequest.userId = userId;
        leaveRequest.leaveTypeId = leaveType.id;
        leaveRequest.startDate = startDate;
        leaveRequest.endDate = endDate;
        leaveRequest.requestType =
            leaveRequestData.requestType || models_1.LeaveRequestType.FULL_DAY;
        leaveRequest.numberOfDays = numberOfDays;
        leaveRequest.reason = leaveRequestData.reason;
        leaveRequest.status = models_1.LeaveRequestStatus.PENDING;
        const savedLeaveRequest = await leaveRequestRepository.save(leaveRequest);
        // Send email notification to manager
        if (user.managerId) {
            try {
                const manager = await userRepository.findOne({
                    where: { id: user.managerId },
                });
                if (manager) {
                    await emailService_1.default.sendLeaveRequestNotification(manager.email, `${user.firstName} ${user.lastName}`, leaveType.name, startDate.toDateString(), endDate.toDateString(), leaveRequestData.reason);
                }
            }
            catch (emailError) {
                logger_1.default.error(`Error sending email notification: ${emailError}`);
            }
        }
        return savedLeaveRequest;
    }
    catch (error) {
        logger_1.default.error(`Error in createLeaveRequest service: ${error}`);
        throw error;
    }
};
exports.createLeaveRequest = createLeaveRequest;
/**
 * Get all leave requests with optional filters
 */
const getAllLeaveRequests = async (filters = {}) => {
    try {
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        // Build query
        const query = {};
        if (filters.userId) {
            query.userId = filters.userId;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.startDate) {
            query.startDate = (0, typeorm_1.MoreThanOrEqual)(filters.startDate);
        }
        if (filters.endDate) {
            query.endDate = (0, typeorm_1.LessThanOrEqual)(filters.endDate);
        }
        // Get leave requests
        return await leaveRequestRepository.find({
            where: query,
            relations: ["user", "leaveType", "approver"],
            order: {
                createdAt: "DESC",
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getAllLeaveRequests service: ${error}`);
        throw error;
    }
};
exports.getAllLeaveRequests = getAllLeaveRequests;
/**
 * Get leave request by ID
 */
const getLeaveRequestById = async (leaveRequestId) => {
    try {
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        // Find leave request by ID
        const leaveRequest = await leaveRequestRepository.findOne({
            where: { id: leaveRequestId },
            relations: ["user", "leaveType", "approver"],
        });
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        return leaveRequest;
    }
    catch (error) {
        logger_1.default.error(`Error in getLeaveRequestById service: ${error}`);
        throw error;
    }
};
exports.getLeaveRequestById = getLeaveRequestById;
/**
 * Get leave requests for a user
 */
const getUserLeaveRequests = async (userId, filters = {}) => {
    try {
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        // Build query
        const query = { userId };
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.year) {
            const startOfYear = new Date(filters.year, 0, 1);
            const endOfYear = new Date(filters.year, 11, 31);
            query.startDate = (0, typeorm_1.MoreThanOrEqual)(startOfYear);
            query.endDate = (0, typeorm_1.LessThanOrEqual)(endOfYear);
        }
        // Get leave requests
        return await leaveRequestRepository.find({
            where: query,
            relations: ["leaveType", "approver"],
            order: {
                createdAt: "DESC",
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getUserLeaveRequests service: ${error}`);
        throw error;
    }
};
exports.getUserLeaveRequests = getUserLeaveRequests;
/**
 * Get leave requests for a manager's team
 */
const getManagerLeaveRequests = async (managerId, filters = {}) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Get users managed by this manager
        const managedUsers = await userRepository.find({
            where: { managerId },
        });
        if (managedUsers.length === 0) {
            return [];
        }
        const managedUserIds = managedUsers.map((user) => user.id);
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        // Build query
        const query = { userId: (0, typeorm_1.In)(managedUserIds) };
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.startDate) {
            query.startDate = (0, typeorm_1.MoreThanOrEqual)(filters.startDate);
        }
        if (filters.endDate) {
            query.endDate = (0, typeorm_1.LessThanOrEqual)(filters.endDate);
        }
        // Get leave requests
        return await leaveRequestRepository.find({
            where: query,
            relations: ["user", "leaveType"],
            order: {
                createdAt: "DESC",
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getManagerLeaveRequests service: ${error}`);
        throw error;
    }
};
exports.getManagerLeaveRequests = getManagerLeaveRequests;
/**
 * Update leave request status
 */
const updateLeaveRequestStatus = async (leaveRequestId, status, approverId, comments) => {
    try {
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Find leave request by ID
        const leaveRequest = await leaveRequestRepository.findOne({
            where: { id: leaveRequestId },
            relations: ["user", "leaveType"],
        });
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        // Check if leave request is already in the requested status
        if (leaveRequest.status === status) {
            throw new Error(`Leave request is already ${status}`);
        }
        // Check if leave request is pending
        if (leaveRequest.status !== models_1.LeaveRequestStatus.PENDING) {
            throw new Error(`Cannot update status of a ${leaveRequest.status} leave request`);
        }
        // Get approver
        const approver = await userRepository.findOne({
            where: { id: approverId },
        });
        if (!approver) {
            throw new Error("Approver not found");
        }
        // Update leave request status
        leaveRequest.status = status;
        leaveRequest.approverId = approverId;
        leaveRequest.approverComments = comments;
        leaveRequest.approvedAt = new Date();
        // If approved, update leave balance
        if (status === models_1.LeaveRequestStatus.APPROVED &&
            leaveRequest.leaveType.isPaidLeave) {
            const currentYear = new Date().getFullYear();
            const leaveBalance = await leaveBalanceRepository.findOne({
                where: {
                    userId: leaveRequest.userId,
                    leaveTypeId: leaveRequest.leaveTypeId,
                    year: currentYear,
                },
            });
            if (leaveBalance) {
                leaveBalance.used += leaveRequest.numberOfDays;
                await leaveBalanceRepository.save(leaveBalance);
            }
        }
        const updatedLeaveRequest = await leaveRequestRepository.save(leaveRequest);
        // Send email notification to user
        try {
            await emailService_1.default.sendLeaveStatusUpdateNotification(leaveRequest.user.email, leaveRequest.leaveType.name, leaveRequest.startDate.toDateString(), leaveRequest.endDate.toDateString(), status, comments);
        }
        catch (emailError) {
            logger_1.default.error(`Error sending email notification: ${emailError}`);
        }
        return updatedLeaveRequest;
    }
    catch (error) {
        logger_1.default.error(`Error in updateLeaveRequestStatus service: ${error}`);
        throw error;
    }
};
exports.updateLeaveRequestStatus = updateLeaveRequestStatus;
/**
 * Cancel leave request
 */
const cancelLeaveRequest = async (leaveRequestId, userId) => {
    try {
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        // Find leave request by ID
        const leaveRequest = await leaveRequestRepository.findOne({
            where: { id: leaveRequestId },
            relations: ["leaveType"],
        });
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        // Check if leave request belongs to the user
        if (leaveRequest.userId !== userId) {
            throw new Error("You can only cancel your own leave requests");
        }
        // Check if leave request can be cancelled
        if (leaveRequest.status === models_1.LeaveRequestStatus.CANCELLED) {
            throw new Error("Leave request is already cancelled");
        }
        const wasApproved = leaveRequest.status === models_1.LeaveRequestStatus.APPROVED;
        // Update leave request status
        leaveRequest.status = models_1.LeaveRequestStatus.CANCELLED;
        // If it was approved, restore leave balance
        if (wasApproved && leaveRequest.leaveType.isPaidLeave) {
            const currentYear = new Date().getFullYear();
            const leaveBalance = await leaveBalanceRepository.findOne({
                where: {
                    userId: leaveRequest.userId,
                    leaveTypeId: leaveRequest.leaveTypeId,
                    year: currentYear,
                },
            });
            if (leaveBalance) {
                leaveBalance.used -= leaveRequest.numberOfDays;
                if (leaveBalance.used < 0) {
                    leaveBalance.used = 0;
                }
                await leaveBalanceRepository.save(leaveBalance);
            }
        }
        return await leaveRequestRepository.save(leaveRequest);
    }
    catch (error) {
        logger_1.default.error(`Error in cancelLeaveRequest service: ${error}`);
        throw error;
    }
};
exports.cancelLeaveRequest = cancelLeaveRequest;
/**
 * Get approval workflow for leave request
 */
const getApprovalWorkflow = async (numberOfDays) => {
    try {
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        // Find approval workflow for the number of days
        const approvalWorkflow = await approvalWorkflowRepository.findOne({
            where: {
                minDays: (0, typeorm_1.LessThanOrEqual)(numberOfDays),
                maxDays: (0, typeorm_1.MoreThanOrEqual)(numberOfDays),
                isActive: true,
            },
        });
        if (!approvalWorkflow) {
            throw new Error("No approval workflow found for this leave duration");
        }
        // Parse the approvalLevels JSON string
        if (typeof approvalWorkflow.approvalLevels === "string") {
            approvalWorkflow.approvalLevels = JSON.parse(approvalWorkflow.approvalLevels);
        }
        return approvalWorkflow;
    }
    catch (error) {
        logger_1.default.error(`Error in getApprovalWorkflow service: ${error}`);
        throw error;
    }
};
exports.getApprovalWorkflow = getApprovalWorkflow;
// Helper functions for TypeORM operators
// TypeORM operators are imported at the top of the file
//# sourceMappingURL=leaveRequestService.js.map