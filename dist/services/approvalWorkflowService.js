"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovalWorkflowForDuration = exports.deleteApprovalWorkflow = exports.updateApprovalWorkflow = exports.getApprovalWorkflowById = exports.getAllApprovalWorkflows = exports.createApprovalWorkflow = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
const typeorm_1 = require("typeorm");
/**
 * Create a new approval workflow
 */
const createApprovalWorkflow = async (workflowData) => {
    try {
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        // Check if workflow with name already exists
        const existingWorkflow = await approvalWorkflowRepository.findOne({
            where: { name: workflowData.name },
        });
        if (existingWorkflow) {
            throw new Error("Approval workflow with this name already exists");
        }
        // Check for overlapping workflows
        const overlappingWorkflows = await approvalWorkflowRepository.find({
            where: [
                {
                    minDays: (0, typeorm_1.LessThanOrEqual)(workflowData.maxDays),
                    maxDays: (0, typeorm_1.MoreThanOrEqual)(workflowData.minDays),
                },
            ],
        });
        if (overlappingWorkflows.length > 0) {
            throw new Error("This workflow overlaps with an existing workflow");
        }
        // Create new approval workflow
        const approvalWorkflow = approvalWorkflowRepository.create(workflowData);
        return await approvalWorkflowRepository.save(approvalWorkflow);
    }
    catch (error) {
        logger_1.default.error(`Error in createApprovalWorkflow service: ${error}`);
        throw error;
    }
};
exports.createApprovalWorkflow = createApprovalWorkflow;
/**
 * Get all approval workflows with optional filters
 */
const getAllApprovalWorkflows = async (filters = {}) => {
    try {
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        // Build query
        const query = {};
        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        // Get approval workflows
        return await approvalWorkflowRepository.find({
            where: query,
            order: {
                minDays: "ASC",
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getAllApprovalWorkflows service: ${error}`);
        throw error;
    }
};
exports.getAllApprovalWorkflows = getAllApprovalWorkflows;
/**
 * Get approval workflow by ID
 */
const getApprovalWorkflowById = async (workflowId) => {
    try {
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        // Find approval workflow by ID
        const approvalWorkflow = await approvalWorkflowRepository.findOne({
            where: { id: workflowId },
        });
        if (!approvalWorkflow) {
            throw new Error("Approval workflow not found");
        }
        return approvalWorkflow;
    }
    catch (error) {
        logger_1.default.error(`Error in getApprovalWorkflowById service: ${error}`);
        throw error;
    }
};
exports.getApprovalWorkflowById = getApprovalWorkflowById;
/**
 * Update approval workflow
 */
const updateApprovalWorkflow = async (workflowId, workflowData) => {
    try {
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        // Find approval workflow by ID
        const approvalWorkflow = await approvalWorkflowRepository.findOne({
            where: { id: workflowId },
        });
        if (!approvalWorkflow) {
            throw new Error("Approval workflow not found");
        }
        // If name is being updated, check if it's already in use
        if (workflowData.name && workflowData.name !== approvalWorkflow.name) {
            const existingWorkflow = await approvalWorkflowRepository.findOne({
                where: { name: workflowData.name },
            });
            if (existingWorkflow) {
                throw new Error("Approval workflow name is already in use");
            }
        }
        // Check for overlapping workflows if changing min/max days
        if ((workflowData.minDays !== undefined &&
            workflowData.minDays !== approvalWorkflow.minDays) ||
            (workflowData.maxDays !== undefined &&
                workflowData.maxDays !== approvalWorkflow.maxDays)) {
            const newMinDays = workflowData.minDays !== undefined
                ? workflowData.minDays
                : approvalWorkflow.minDays;
            const newMaxDays = workflowData.maxDays !== undefined
                ? workflowData.maxDays
                : approvalWorkflow.maxDays;
            const overlappingWorkflows = await approvalWorkflowRepository.find({
                where: [
                    {
                        id: (0, typeorm_1.Not)(workflowId),
                        minDays: (0, typeorm_1.LessThanOrEqual)(newMaxDays),
                        maxDays: (0, typeorm_1.MoreThanOrEqual)(newMinDays),
                    },
                ],
            });
            if (overlappingWorkflows.length > 0) {
                throw new Error("This workflow would overlap with an existing workflow");
            }
        }
        // Update approval workflow data
        approvalWorkflowRepository.merge(approvalWorkflow, workflowData);
        // Save updated approval workflow
        return await approvalWorkflowRepository.save(approvalWorkflow);
    }
    catch (error) {
        logger_1.default.error(`Error in updateApprovalWorkflow service: ${error}`);
        throw error;
    }
};
exports.updateApprovalWorkflow = updateApprovalWorkflow;
/**
 * Delete approval workflow
 */
const deleteApprovalWorkflow = async (workflowId) => {
    try {
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        // Find approval workflow by ID
        const approvalWorkflow = await approvalWorkflowRepository.findOne({
            where: { id: workflowId },
        });
        if (!approvalWorkflow) {
            throw new Error("Approval workflow not found");
        }
        // Delete approval workflow
        await approvalWorkflowRepository.remove(approvalWorkflow);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteApprovalWorkflow service: ${error}`);
        throw error;
    }
};
exports.deleteApprovalWorkflow = deleteApprovalWorkflow;
/**
 * Get approval workflow for leave duration
 */
const getApprovalWorkflowForDuration = async (days) => {
    try {
        const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
        // Find approval workflow for the number of days
        const approvalWorkflow = await approvalWorkflowRepository.findOne({
            where: {
                minDays: (0, typeorm_1.LessThanOrEqual)(days),
                maxDays: (0, typeorm_1.MoreThanOrEqual)(days),
                isActive: true,
            },
        });
        if (!approvalWorkflow) {
            throw new Error("No approval workflow found for this leave duration");
        }
        return approvalWorkflow;
    }
    catch (error) {
        logger_1.default.error(`Error in getApprovalWorkflowForDuration service: ${error}`);
        throw error;
    }
};
exports.getApprovalWorkflowForDuration = getApprovalWorkflowForDuration;
// TypeORM operators are imported at the top of the file
//# sourceMappingURL=approvalWorkflowService.js.map