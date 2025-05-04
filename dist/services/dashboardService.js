"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeeDashboard = exports.getManagerDashboard = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const dateUtils_1 = require("../utils/dateUtils");
const logger_1 = __importDefault(require("../utils/logger"));
const typeorm_1 = require("typeorm");
/**
 * Get manager dashboard data
 */
const getManagerDashboard = async (managerId) => {
    try {
        // Get all users managed by this manager
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const managedUsers = await userRepository.find({ where: { managerId } });
        if (managedUsers.length === 0) {
            return {
                pendingRequests: [],
                pendingCount: 0,
                approvedRequests: [],
                approvedCount: 0,
                teamAvailability: [],
                upcomingHolidays: [],
            };
        }
        const managedUserIds = managedUsers.map((user) => user.id);
        // Get pending leave requests
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        const pendingRequests = await leaveRequestRepository.find({
            where: {
                userId: (0, typeorm_1.In)(managedUserIds),
                status: models_1.LeaveRequestStatus.PENDING,
            },
            relations: ["user", "leaveType"],
            order: {
                createdAt: "DESC",
            },
            take: 5,
        });
        // Get approved leave requests for the current month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const approvedRequests = await leaveRequestRepository.find({
            where: {
                userId: (0, typeorm_1.In)(managedUserIds),
                status: models_1.LeaveRequestStatus.APPROVED,
                startDate: (0, typeorm_1.MoreThanOrEqual)(startOfMonth),
                endDate: (0, typeorm_1.LessThanOrEqual)(endOfMonth),
            },
            relations: ["user", "leaveType"],
            order: {
                startDate: "ASC",
            },
        });
        // Calculate team availability for the next 7 days
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const upcomingLeaves = await leaveRequestRepository.find({
            where: {
                userId: (0, typeorm_1.In)(managedUserIds),
                status: models_1.LeaveRequestStatus.APPROVED,
                startDate: (0, typeorm_1.LessThanOrEqual)(nextWeek),
                endDate: (0, typeorm_1.MoreThanOrEqual)(today),
            },
            relations: ["user"],
        });
        // Get upcoming holidays
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        const upcomingHolidays = await holidayRepository.find({
            where: {
                date: (0, typeorm_1.Between)(today, nextWeek),
                isActive: true,
            },
            order: {
                date: "ASC",
            },
        });
        // Calculate team availability
        const teamAvailability = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            date.setHours(0, 0, 0, 0);
            const formattedDate = formatDate(date);
            // Check if it's a weekend
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            // Check if it's a holiday
            const isHoliday = upcomingHolidays.some((holiday) => {
                const holidayDate = new Date(holiday.date);
                holidayDate.setHours(0, 0, 0, 0);
                return holidayDate.getTime() === date.getTime();
            });
            // Get users on leave for this date
            const usersOnLeave = upcomingLeaves
                .filter((leave) => {
                const startDate = new Date(leave.startDate);
                const endDate = new Date(leave.endDate);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                return date >= startDate && date <= endDate;
            })
                .map((leave) => ({
                id: leave.userId,
                name: `${leave.user.firstName} ${leave.user.lastName}`,
            }));
            // Calculate available users
            const availableUsers = managedUsers
                .filter((user) => !usersOnLeave.some((leaveUser) => leaveUser.id === user.id))
                .map((user) => ({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
            }));
            teamAvailability.push({
                date: formattedDate,
                isWeekend,
                isHoliday,
                totalUsers: managedUsers.length,
                availableUsers,
                availableCount: availableUsers.length,
                usersOnLeave,
                onLeaveCount: usersOnLeave.length,
            });
        }
        // Count pending requests
        const pendingCount = await leaveRequestRepository.count({
            where: {
                userId: (0, typeorm_1.In)(managedUserIds),
                status: models_1.LeaveRequestStatus.PENDING,
            },
        });
        return {
            pendingRequests,
            pendingCount,
            approvedRequests,
            approvedCount: approvedRequests.length,
            teamAvailability,
            upcomingHolidays,
        };
    }
    catch (error) {
        logger_1.default.error(`Error in getManagerDashboard service: ${error}`);
        throw error;
    }
};
exports.getManagerDashboard = getManagerDashboard;
/**
 * Get employee dashboard data
 */
const getEmployeeDashboard = async (userId) => {
    try {
        // Get user's leave requests
        const leaveRequestRepository = database_1.AppDataSource.getRepository(models_1.LeaveRequest);
        // Get pending leave requests
        const pendingRequests = await leaveRequestRepository.find({
            where: {
                userId,
                status: models_1.LeaveRequestStatus.PENDING,
            },
            relations: ["leaveType"],
            order: {
                createdAt: "DESC",
            },
        });
        // Get upcoming approved leave requests
        const today = new Date();
        const upcomingRequests = await leaveRequestRepository.find({
            where: {
                userId,
                status: models_1.LeaveRequestStatus.APPROVED,
                startDate: (0, typeorm_1.MoreThanOrEqual)(today),
            },
            relations: ["leaveType"],
            order: {
                startDate: "ASC",
            },
            take: 5,
        });
        // Get recent leave history
        const recentHistory = await leaveRequestRepository.find({
            where: {
                userId,
                endDate: (0, typeorm_1.LessThanOrEqual)(today),
            },
            relations: ["leaveType"],
            order: {
                endDate: "DESC",
            },
            take: 5,
        });
        // Get upcoming holidays
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        const upcomingHolidays = await holidayRepository.find({
            where: {
                date: (0, typeorm_1.Between)(today, nextMonth),
                isActive: true,
            },
            order: {
                date: "ASC",
            },
        });
        // Get leave statistics for the current year
        const currentYear = (0, dateUtils_1.getCurrentYear)();
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const leaveBalances = await leaveBalanceRepository.find({
            where: {
                userId,
                year: currentYear,
            },
            relations: ["leaveType"],
        });
        const leaveStatistics = leaveBalances.map((balance) => ({
            leaveType: balance.leaveType.name,
            balance: balance.balance,
            used: balance.used,
            carryForward: balance.carryForward,
            remaining: balance.balance + balance.carryForward - balance.used,
        }));
        return {
            pendingRequests,
            pendingCount: pendingRequests.length,
            upcomingRequests,
            recentHistory,
            upcomingHolidays,
            leaveStatistics,
        };
    }
    catch (error) {
        logger_1.default.error(`Error in getEmployeeDashboard service: ${error}`);
        throw error;
    }
};
exports.getEmployeeDashboard = getEmployeeDashboard;
// Helper functions
function formatDate(date) {
    return date.toISOString().split("T")[0];
}
// Remove these helper functions as we're using TypeORM's operators directly
//# sourceMappingURL=dashboardService.js.map