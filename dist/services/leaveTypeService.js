"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeaveType = exports.updateLeaveType = exports.getLeaveTypeById = exports.getAllLeaveTypes = exports.createLeaveType = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Create a new leave type
 */
const createLeaveType = async (leaveTypeData) => {
    try {
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        // Check if leave type with name already exists
        const existingLeaveType = await leaveTypeRepository.findOne({
            where: { name: leaveTypeData.name },
        });
        if (existingLeaveType) {
            throw new Error('Leave type with this name already exists');
        }
        // Create new leave type
        const leaveType = leaveTypeRepository.create(leaveTypeData);
        return await leaveTypeRepository.save(leaveType);
    }
    catch (error) {
        logger_1.default.error(`Error in createLeaveType service: ${error}`);
        throw error;
    }
};
exports.createLeaveType = createLeaveType;
/**
 * Get all leave types with optional filters
 */
const getAllLeaveTypes = async (filters = {}) => {
    try {
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        // Build query
        const query = {};
        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        // Get leave types
        return await leaveTypeRepository.find({
            where: query,
            order: {
                name: 'ASC',
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getAllLeaveTypes service: ${error}`);
        throw error;
    }
};
exports.getAllLeaveTypes = getAllLeaveTypes;
/**
 * Get leave type by ID
 */
const getLeaveTypeById = async (leaveTypeId) => {
    try {
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        // Find leave type by ID
        const leaveType = await leaveTypeRepository.findOne({
            where: { id: leaveTypeId },
        });
        if (!leaveType) {
            throw new Error('Leave type not found');
        }
        return leaveType;
    }
    catch (error) {
        logger_1.default.error(`Error in getLeaveTypeById service: ${error}`);
        throw error;
    }
};
exports.getLeaveTypeById = getLeaveTypeById;
/**
 * Update leave type
 */
const updateLeaveType = async (leaveTypeId, leaveTypeData) => {
    try {
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        // Find leave type by ID
        const leaveType = await leaveTypeRepository.findOne({
            where: { id: leaveTypeId },
        });
        if (!leaveType) {
            throw new Error('Leave type not found');
        }
        // If name is being updated, check if it's already in use
        if (leaveTypeData.name && leaveTypeData.name !== leaveType.name) {
            const existingLeaveType = await leaveTypeRepository.findOne({
                where: { name: leaveTypeData.name },
            });
            if (existingLeaveType) {
                throw new Error('Leave type name is already in use');
            }
        }
        // Update leave type data
        leaveTypeRepository.merge(leaveType, leaveTypeData);
        // Save updated leave type
        return await leaveTypeRepository.save(leaveType);
    }
    catch (error) {
        logger_1.default.error(`Error in updateLeaveType service: ${error}`);
        throw error;
    }
};
exports.updateLeaveType = updateLeaveType;
/**
 * Delete leave type
 */
const deleteLeaveType = async (leaveTypeId) => {
    try {
        const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
        // Find leave type by ID
        const leaveType = await leaveTypeRepository.findOne({
            where: { id: leaveTypeId },
        });
        if (!leaveType) {
            throw new Error('Leave type not found');
        }
        // Delete leave type
        await leaveTypeRepository.remove(leaveType);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteLeaveType service: ${error}`);
        throw error;
    }
};
exports.deleteLeaveType = deleteLeaveType;
//# sourceMappingURL=leaveTypeService.js.map