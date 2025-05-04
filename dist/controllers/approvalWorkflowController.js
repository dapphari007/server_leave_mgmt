"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApprovalWorkflow = exports.updateApprovalWorkflow = exports.getApprovalWorkflowById = exports.getAllApprovalWorkflows = exports.createApprovalWorkflow = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
const typeorm_1 = require("typeorm");
const createApprovalWorkflow = async (request, h) => {
    try {
        const { name, minDays, maxDays, approvalLevels, isActive } = request.payload;
        // Validate input
        if (!name ||
            minDays === undefined ||
            maxDays === undefined ||
            !approvalLevels) {
            return h
                .response({
                message: "Name, minDays, maxDays, and approvalLevels are required",
            })
                .code(400);
        }
        if (minDays < 0 || maxDays < 0) {
            return h
                .response({ message: "minDays and maxDays must be non-negative" })
                .code(400);
        }
        if (minDays > maxDays) {
            return h
                .response({ message: "minDays cannot be greater than maxDays" })
                .code(400);
        }
        if (!Array.isArray(approvalLevels) || approvalLevels.length === 0) {
            return h
                .response({ message: "approvalLevels must be a non-empty array" })
                .code(400);
        }
        // Validate approval levels
        for (const level of approvalLevels) {
            if (!level.level ||
                !level.roles ||
                !Array.isArray(level.roles) ||
                level.roles.length === 0) {
                return h
                    .response({
                    message: "Each approval level must have a level number and non-empty roles array",
                })
                    .code(400);
            }
            for (const role of level.roles) {
                if (!Object.values(models_1.UserRole).includes(role)) {
                    return h.response({ message: `Invalid role: ${role}` }).code(400);
                }
            }
        }
        // Check for overlapping workflows
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        const overlappingWorkflows = await approvalWorkflowRepository.find({
            where: [
                {
                    minDays: (0, typeorm_1.LessThanOrEqual)(maxDays),
                    maxDays: (0, typeorm_1.MoreThanOrEqual)(minDays),
                },
            ],
        });
        if (overlappingWorkflows.length > 0) {
            return h
                .response({
                message: "This workflow overlaps with an existing workflow",
            })
                .code(409);
        }
        // Create new approval workflow
        const approvalWorkflow = new models_1.ApprovalWorkflow();
        approvalWorkflow.name = name;
        approvalWorkflow.minDays = minDays;
        approvalWorkflow.maxDays = maxDays;
        approvalWorkflow.approvalLevels = JSON.stringify(approvalLevels);
        approvalWorkflow.isActive = isActive !== undefined ? isActive : true;
        // Save approval workflow to database
        const savedApprovalWorkflow = await approvalWorkflowRepository.save(approvalWorkflow);
        return h
            .response({
            message: "Approval workflow created successfully",
            approvalWorkflow: savedApprovalWorkflow,
        })
            .code(201);
    }
    catch (error) {
        logger_1.default.error(`Error in createApprovalWorkflow: ${error}`);
        return h
            .response({
            message: "An error occurred while creating the approval workflow",
        })
            .code(500);
    }
};
exports.createApprovalWorkflow = createApprovalWorkflow;
const getAllApprovalWorkflows = async (request, h) => {
    try {
        const { isActive } = request.query;
        // Build query
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        let query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }
        // Get approval workflows
        const approvalWorkflows = await approvalWorkflowRepository.find({
            where: query,
            order: {
                minDays: "ASC",
            },
        });
        return h
            .response({
            approvalWorkflows,
            count: approvalWorkflows.length,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getAllApprovalWorkflows: ${error}`);
        return h
            .response({
            message: "An error occurred while fetching approval workflows",
        })
            .code(500);
    }
};
exports.getAllApprovalWorkflows = getAllApprovalWorkflows;
const getApprovalWorkflowById = async (request, h) => {
    try {
        const { id } = request.params;
        // Get approval workflow
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        const approvalWorkflow = await approvalWorkflowRepository.findOne({
            where: { id },
        });
        if (!approvalWorkflow) {
            return h.response({ message: "Approval workflow not found" }).code(404);
        }
        return h
            .response({
            approvalWorkflow,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getApprovalWorkflowById: ${error}`);
        return h
            .response({
            message: "An error occurred while fetching the approval workflow",
        })
            .code(500);
    }
};
exports.getApprovalWorkflowById = getApprovalWorkflowById;
const updateApprovalWorkflow = async (request, h) => {
    try {
        const { id } = request.params;
        const { name, minDays, maxDays, approvalLevels, isActive } = request.payload;
        // Get approval workflow
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        const approvalWorkflow = await approvalWorkflowRepository.findOne({
            where: { id },
        });
        if (!approvalWorkflow) {
            return h.response({ message: "Approval workflow not found" }).code(404);
        }
        // Validate approval levels if provided
        if (approvalLevels) {
            if (!Array.isArray(approvalLevels) || approvalLevels.length === 0) {
                return h
                    .response({ message: "approvalLevels must be a non-empty array" })
                    .code(400);
            }
            for (const level of approvalLevels) {
                if (!level.level ||
                    !level.roles ||
                    !Array.isArray(level.roles) ||
                    level.roles.length === 0) {
                    return h
                        .response({
                        message: "Each approval level must have a level number and non-empty roles array",
                    })
                        .code(400);
                }
                for (const role of level.roles) {
                    if (!Object.values(models_1.UserRole).includes(role)) {
                        return h.response({ message: `Invalid role: ${role}` }).code(400);
                    }
                }
            }
        }
        // Check for overlapping workflows if changing min/max days
        if ((minDays !== undefined && minDays !== approvalWorkflow.minDays) ||
            (maxDays !== undefined && maxDays !== approvalWorkflow.maxDays)) {
            const newMinDays = minDays !== undefined ? minDays : approvalWorkflow.minDays;
            const newMaxDays = maxDays !== undefined ? maxDays : approvalWorkflow.maxDays;
            if (newMinDays < 0 || newMaxDays < 0) {
                return h
                    .response({ message: "minDays and maxDays must be non-negative" })
                    .code(400);
            }
            if (newMinDays > newMaxDays) {
                return h
                    .response({ message: "minDays cannot be greater than maxDays" })
                    .code(400);
            }
            const overlappingWorkflows = await approvalWorkflowRepository.find({
                where: [
                    {
                        id: (0, typeorm_1.Not)(id),
                        minDays: (0, typeorm_1.LessThanOrEqual)(newMaxDays),
                        maxDays: (0, typeorm_1.MoreThanOrEqual)(newMinDays),
                    },
                ],
            });
            if (overlappingWorkflows.length > 0) {
                return h
                    .response({
                    message: "This workflow would overlap with an existing workflow",
                })
                    .code(409);
            }
        }
        // Update approval workflow fields
        if (name)
            approvalWorkflow.name = name;
        if (minDays !== undefined)
            approvalWorkflow.minDays = minDays;
        if (maxDays !== undefined)
            approvalWorkflow.maxDays = maxDays;
        if (approvalLevels)
            approvalWorkflow.approvalLevels = JSON.stringify(approvalLevels);
        if (isActive !== undefined)
            approvalWorkflow.isActive = isActive;
        // Save updated approval workflow
        const updatedApprovalWorkflow = await approvalWorkflowRepository.save(approvalWorkflow);
        return h
            .response({
            message: "Approval workflow updated successfully",
            approvalWorkflow: updatedApprovalWorkflow,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in updateApprovalWorkflow: ${error}`);
        return h
            .response({
            message: "An error occurred while updating the approval workflow",
        })
            .code(500);
    }
};
exports.updateApprovalWorkflow = updateApprovalWorkflow;
const deleteApprovalWorkflow = async (request, h) => {
    try {
        const { id } = request.params;
        // Get approval workflow
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        const approvalWorkflow = await approvalWorkflowRepository.findOne({
            where: { id },
        });
        if (!approvalWorkflow) {
            return h.response({ message: "Approval workflow not found" }).code(404);
        }
        // Delete approval workflow
        await approvalWorkflowRepository.remove(approvalWorkflow);
        return h
            .response({
            message: "Approval workflow deleted successfully",
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteApprovalWorkflow: ${error}`);
        return h
            .response({
            message: "An error occurred while deleting the approval workflow",
        })
            .code(500);
    }
};
exports.deleteApprovalWorkflow = deleteApprovalWorkflow;
//# sourceMappingURL=approvalWorkflowController.js.map