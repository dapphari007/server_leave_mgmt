"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeaveType = exports.updateLeaveType = exports.getLeaveTypeById = exports.getAllLeaveTypes = exports.createLeaveType = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
const createLeaveType = async (request, h) => {
    try {
        const { name, description, defaultDays, isCarryForward, maxCarryForwardDays, isActive, applicableGender, isHalfDayAllowed, isPaidLeave, } = request.payload;
        // Validate input
        if (!name || !description || defaultDays === undefined) {
            return h
                .response({
                message: "Name, description, and defaultDays are required",
            })
                .code(400);
        }
        // Check if leave type already exists
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        const existingLeaveType = await leaveTypeRepository.findOne({
            where: { name },
        });
        if (existingLeaveType) {
            return h
                .response({ message: "Leave type with this name already exists" })
                .code(409);
        }
        // Validate applicable gender if provided
        if (applicableGender &&
            !["male", "female", "other"].includes(applicableGender)) {
            return h.response({ message: "Invalid applicable gender" }).code(400);
        }
        // Create new leave type
        const leaveType = new models_1.LeaveType();
        leaveType.name = name;
        leaveType.description = description;
        leaveType.defaultDays = defaultDays;
        leaveType.isCarryForward =
            isCarryForward !== undefined ? isCarryForward : false;
        leaveType.maxCarryForwardDays =
            maxCarryForwardDays !== undefined ? maxCarryForwardDays : 0;
        leaveType.isActive = isActive !== undefined ? isActive : true;
        leaveType.applicableGender = applicableGender || null;
        leaveType.isHalfDayAllowed =
            isHalfDayAllowed !== undefined ? isHalfDayAllowed : false;
        leaveType.isPaidLeave = isPaidLeave !== undefined ? isPaidLeave : true;
        // Save leave type to database
        const savedLeaveType = await leaveTypeRepository.save(leaveType);
        return h
            .response({
            message: "Leave type created successfully",
            leaveType: savedLeaveType,
        })
            .code(201);
    }
    catch (error) {
        logger_1.default.error(`Error in createLeaveType: ${error}`);
        return h
            .response({ message: "An error occurred while creating the leave type" })
            .code(500);
    }
};
exports.createLeaveType = createLeaveType;
const getAllLeaveTypes = async (request, h) => {
    try {
        const { isActive } = request.query;
        // Build query
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        let query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }
        // Get leave types
        const leaveTypes = await leaveTypeRepository.find({
            where: query,
            order: {
                name: "ASC",
            },
        });
        return h
            .response({
            leaveTypes,
            count: leaveTypes.length,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getAllLeaveTypes: ${error}`);
        return h
            .response({ message: "An error occurred while fetching leave types" })
            .code(500);
    }
};
exports.getAllLeaveTypes = getAllLeaveTypes;
const getLeaveTypeById = async (request, h) => {
    try {
        const { id } = request.params;
        // Get leave type
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        const leaveType = await leaveTypeRepository.findOne({ where: { id } });
        if (!leaveType) {
            return h.response({ message: "Leave type not found" }).code(404);
        }
        return h
            .response({
            leaveType,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getLeaveTypeById: ${error}`);
        return h
            .response({ message: "An error occurred while fetching the leave type" })
            .code(500);
    }
};
exports.getLeaveTypeById = getLeaveTypeById;
const updateLeaveType = async (request, h) => {
    try {
        const { id } = request.params;
        const { name, description, defaultDays, isCarryForward, maxCarryForwardDays, isActive, applicableGender, isHalfDayAllowed, isPaidLeave, } = request.payload;
        // Get leave type
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        const leaveType = await leaveTypeRepository.findOne({ where: { id } });
        if (!leaveType) {
            return h.response({ message: "Leave type not found" }).code(404);
        }
        // Check if name is being changed and if it already exists
        if (name && name !== leaveType.name) {
            const existingLeaveType = await leaveTypeRepository.findOne({
                where: { name },
            });
            if (existingLeaveType) {
                return h
                    .response({ message: "Leave type with this name already exists" })
                    .code(409);
            }
        }
        // Validate applicable gender if provided
        if (applicableGender &&
            !["male", "female", "other"].includes(applicableGender)) {
            return h.response({ message: "Invalid applicable gender" }).code(400);
        }
        // Update leave type fields
        if (name)
            leaveType.name = name;
        if (description)
            leaveType.description = description;
        if (defaultDays !== undefined)
            leaveType.defaultDays = defaultDays;
        if (isCarryForward !== undefined)
            leaveType.isCarryForward = isCarryForward;
        if (maxCarryForwardDays !== undefined)
            leaveType.maxCarryForwardDays = maxCarryForwardDays;
        if (isActive !== undefined)
            leaveType.isActive = isActive;
        if (applicableGender !== undefined)
            leaveType.applicableGender = applicableGender;
        if (isHalfDayAllowed !== undefined)
            leaveType.isHalfDayAllowed = isHalfDayAllowed;
        if (isPaidLeave !== undefined)
            leaveType.isPaidLeave = isPaidLeave;
        // Save updated leave type
        const updatedLeaveType = await leaveTypeRepository.save(leaveType);
        return h
            .response({
            message: "Leave type updated successfully",
            leaveType: updatedLeaveType,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in updateLeaveType: ${error}`);
        return h
            .response({ message: "An error occurred while updating the leave type" })
            .code(500);
    }
};
exports.updateLeaveType = updateLeaveType;
const deleteLeaveType = async (request, h) => {
    try {
        const { id } = request.params;
        // Get leave type
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        const leaveType = await leaveTypeRepository.findOne({
            where: { id },
            relations: ["leaveRequests", "leaveBalances"],
        });
        if (!leaveType) {
            return h.response({ message: "Leave type not found" }).code(404);
        }
        // Check if leave type is being used
        if (leaveType.leaveRequests && leaveType.leaveRequests.length > 0) {
            return h
                .response({
                message: "Cannot delete leave type that is associated with leave requests",
            })
                .code(400);
        }
        if (leaveType.leaveBalances && leaveType.leaveBalances.length > 0) {
            return h
                .response({
                message: "Cannot delete leave type that is associated with leave balances",
            })
                .code(400);
        }
        // Delete leave type
        await leaveTypeRepository.remove(leaveType);
        return h
            .response({
            message: "Leave type deleted successfully",
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteLeaveType: ${error}`);
        return h
            .response({ message: "An error occurred while deleting the leave type" })
            .code(500);
    }
};
exports.deleteLeaveType = deleteLeaveType;
//# sourceMappingURL=leaveTypeController.js.map