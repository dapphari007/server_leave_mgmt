"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateLeaveBalances = exports.deleteLeaveBalance = exports.updateLeaveBalance = exports.getUserLeaveBalances = exports.getLeaveBalanceById = exports.getAllLeaveBalances = exports.createLeaveBalance = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const dateUtils_1 = require("../utils/dateUtils");
const emailService_1 = __importDefault(require("../utils/emailService"));
const logger_1 = __importDefault(require("../utils/logger"));
const createLeaveBalance = async (request, h) => {
    try {
        const { userId, leaveTypeId, balance, used, carryForward, year } = request.payload;
        // Validate input
        if (!userId || !leaveTypeId || balance === undefined) {
            return h
                .response({
                message: "User ID, leave type ID, and balance are required",
            })
                .code(400);
        }
        // Check if user exists
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }
        // Check if leave type exists
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        const leaveType = await leaveTypeRepository.findOne({
            where: { id: leaveTypeId },
        });
        if (!leaveType) {
            return h.response({ message: "Leave type not found" }).code(404);
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
        // Check if leave balance already exists for this user, leave type, and year
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const existingLeaveBalance = await leaveBalanceRepository.findOne({
            where: {
                userId,
                leaveTypeId,
                year: year || (0, dateUtils_1.getCurrentYear)(),
            },
        });
        if (existingLeaveBalance) {
            return h
                .response({
                message: "Leave balance already exists for this user, leave type, and year",
            })
                .code(409);
        }
        // Create new leave balance
        const leaveBalance = new models_1.LeaveBalance();
        leaveBalance.userId = userId;
        leaveBalance.leaveTypeId = leaveTypeId;
        leaveBalance.balance = balance;
        leaveBalance.used = used || 0;
        leaveBalance.carryForward = carryForward || 0;
        leaveBalance.year = year || (0, dateUtils_1.getCurrentYear)();
        // Save leave balance to database
        const savedLeaveBalance = await leaveBalanceRepository.save(leaveBalance);
        // Send email notification
        await emailService_1.default.sendLeaveBalanceUpdateNotification(user.email, leaveType.name, balance);
        return h
            .response({
            message: "Leave balance created successfully",
            leaveBalance: savedLeaveBalance,
        })
            .code(201);
    }
    catch (error) {
        logger_1.default.error(`Error in createLeaveBalance: ${error}`);
        return h
            .response({
            message: "An error occurred while creating the leave balance",
        })
            .code(500);
    }
};
exports.createLeaveBalance = createLeaveBalance;
const getAllLeaveBalances = async (request, h) => {
    try {
        const { userId, leaveTypeId, year } = request.query;
        // Build query
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        let query = {};
        if (userId) {
            query.userId = userId;
        }
        if (leaveTypeId) {
            query.leaveTypeId = leaveTypeId;
        }
        if (year) {
            query.year = year;
        }
        // Get leave balances with relations
        const leaveBalances = await leaveBalanceRepository.find({
            where: query,
            relations: ["user", "leaveType"],
            order: {
                year: "DESC",
            },
        });
        return h
            .response({
            leaveBalances,
            count: leaveBalances.length,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getAllLeaveBalances: ${error}`);
        return h
            .response({ message: "An error occurred while fetching leave balances" })
            .code(500);
    }
};
exports.getAllLeaveBalances = getAllLeaveBalances;
const getLeaveBalanceById = async (request, h) => {
    try {
        const { id } = request.params;
        // Get leave balance
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const leaveBalance = await leaveBalanceRepository.findOne({
            where: { id },
            relations: ["user", "leaveType"],
        });
        if (!leaveBalance) {
            return h.response({ message: "Leave balance not found" }).code(404);
        }
        return h
            .response({
            leaveBalance,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getLeaveBalanceById: ${error}`);
        return h
            .response({
            message: "An error occurred while fetching the leave balance",
        })
            .code(500);
    }
};
exports.getLeaveBalanceById = getLeaveBalanceById;
const getUserLeaveBalances = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;
        const { year } = request.query;
        // Build query
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        let query = { userId };
        if (year) {
            query.year = year;
        }
        else {
            query.year = (0, dateUtils_1.getCurrentYear)();
        }
        // Get leave balances
        const leaveBalances = await leaveBalanceRepository.find({
            where: query,
            relations: ["leaveType"],
            order: {
                leaveType: {
                    name: "ASC",
                },
            },
        });
        return h
            .response({
            leaveBalances,
            count: leaveBalances.length,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getUserLeaveBalances: ${error}`);
        return h
            .response({ message: "An error occurred while fetching leave balances" })
            .code(500);
    }
};
exports.getUserLeaveBalances = getUserLeaveBalances;
const updateLeaveBalance = async (request, h) => {
    try {
        const { id } = request.params;
        const { balance, used, carryForward } = request.payload;
        // Get leave balance
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const leaveBalance = await leaveBalanceRepository.findOne({
            where: { id },
            relations: ["user", "leaveType"],
        });
        if (!leaveBalance) {
            return h.response({ message: "Leave balance not found" }).code(404);
        }
        // Update leave balance fields
        if (balance !== undefined)
            leaveBalance.balance = balance;
        if (used !== undefined)
            leaveBalance.used = used;
        if (carryForward !== undefined)
            leaveBalance.carryForward = carryForward;
        // Save updated leave balance
        const updatedLeaveBalance = await leaveBalanceRepository.save(leaveBalance);
        // Send email notification
        if (balance !== undefined && leaveBalance.user && leaveBalance.leaveType) {
            await emailService_1.default.sendLeaveBalanceUpdateNotification(leaveBalance.user.email, leaveBalance.leaveType.name, balance);
        }
        return h
            .response({
            message: "Leave balance updated successfully",
            leaveBalance: updatedLeaveBalance,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in updateLeaveBalance: ${error}`);
        return h
            .response({
            message: "An error occurred while updating the leave balance",
        })
            .code(500);
    }
};
exports.updateLeaveBalance = updateLeaveBalance;
const deleteLeaveBalance = async (request, h) => {
    try {
        const { id } = request.params;
        // Get leave balance
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const leaveBalance = await leaveBalanceRepository.findOne({
            where: { id },
        });
        if (!leaveBalance) {
            return h.response({ message: "Leave balance not found" }).code(404);
        }
        // Delete leave balance
        await leaveBalanceRepository.remove(leaveBalance);
        return h
            .response({
            message: "Leave balance deleted successfully",
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteLeaveBalance: ${error}`);
        return h
            .response({
            message: "An error occurred while deleting the leave balance",
        })
            .code(500);
    }
};
exports.deleteLeaveBalance = deleteLeaveBalance;
const bulkCreateLeaveBalances = async (request, h) => {
    try {
        const { leaveTypeId, year, resetExisting } = request.payload;
        // Validate input
        if (!leaveTypeId) {
            return h.response({ message: "Leave type ID is required" }).code(400);
        }
        // Check if leave type exists
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        const leaveType = await leaveTypeRepository.findOne({
            where: { id: leaveTypeId },
        });
        if (!leaveType) {
            return h.response({ message: "Leave type not found" }).code(404);
        }
        // Get all active users
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const users = await userRepository.find({ where: { isActive: true } });
        // Get current year if not provided
        const targetYear = year || (0, dateUtils_1.getCurrentYear)();
        // Create leave balances for all users
        const leaveBalanceRepository = database_1.AppDataSource.getRepository(models_1.LeaveBalance);
        const results = {
            created: 0,
            updated: 0,
            skipped: 0,
        };
        for (const user of users) {
            // Skip users with incompatible gender for gender-specific leave types
            if (leaveType.applicableGender &&
                user.gender !== leaveType.applicableGender) {
                results.skipped++;
                continue;
            }
            // Check if leave balance already exists
            const existingLeaveBalance = await leaveBalanceRepository.findOne({
                where: {
                    userId: user.id,
                    leaveTypeId,
                    year: targetYear,
                },
            });
            if (existingLeaveBalance) {
                if (resetExisting) {
                    // Update existing leave balance
                    existingLeaveBalance.balance = leaveType.defaultDays;
                    existingLeaveBalance.used = 0;
                    // Calculate carry forward if enabled
                    if (leaveType.isCarryForward) {
                        const previousYearBalance = await leaveBalanceRepository.findOne({
                            where: {
                                userId: user.id,
                                leaveTypeId,
                                year: targetYear - 1,
                            },
                        });
                        if (previousYearBalance) {
                            const remainingBalance = previousYearBalance.balance - previousYearBalance.used;
                            existingLeaveBalance.carryForward = Math.min(remainingBalance > 0 ? remainingBalance : 0, leaveType.maxCarryForwardDays);
                        }
                    }
                    else {
                        existingLeaveBalance.carryForward = 0;
                    }
                    await leaveBalanceRepository.save(existingLeaveBalance);
                    results.updated++;
                    // Send email notification
                    await emailService_1.default.sendLeaveBalanceUpdateNotification(user.email, leaveType.name, existingLeaveBalance.balance + existingLeaveBalance.carryForward);
                }
                else {
                    results.skipped++;
                }
            }
            else {
                // Create new leave balance
                const leaveBalance = new models_1.LeaveBalance();
                leaveBalance.userId = user.id;
                leaveBalance.leaveTypeId = leaveTypeId;
                leaveBalance.balance = leaveType.defaultDays;
                leaveBalance.used = 0;
                // Calculate carry forward if enabled
                if (leaveType.isCarryForward) {
                    const previousYearBalance = await leaveBalanceRepository.findOne({
                        where: {
                            userId: user.id,
                            leaveTypeId,
                            year: targetYear - 1,
                        },
                    });
                    if (previousYearBalance) {
                        const remainingBalance = previousYearBalance.balance - previousYearBalance.used;
                        leaveBalance.carryForward = Math.min(remainingBalance > 0 ? remainingBalance : 0, leaveType.maxCarryForwardDays);
                    }
                    else {
                        leaveBalance.carryForward = 0;
                    }
                }
                else {
                    leaveBalance.carryForward = 0;
                }
                leaveBalance.year = targetYear;
                await leaveBalanceRepository.save(leaveBalance);
                results.created++;
                // Send email notification
                await emailService_1.default.sendLeaveBalanceUpdateNotification(user.email, leaveType.name, leaveBalance.balance + leaveBalance.carryForward);
            }
        }
        return h
            .response({
            message: "Bulk leave balance creation completed",
            results,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in bulkCreateLeaveBalances: ${error}`);
        return h
            .response({ message: "An error occurred while creating leave balances" })
            .code(500);
    }
};
exports.bulkCreateLeaveBalances = bulkCreateLeaveBalances;
//# sourceMappingURL=leaveBalanceController.js.map