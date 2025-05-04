import { ApprovalWorkflow } from "../models";
/**
 * Create a new approval workflow
 */
export declare const createApprovalWorkflow: (workflowData: Partial<ApprovalWorkflow>) => Promise<ApprovalWorkflow>;
/**
 * Get all approval workflows with optional filters
 */
export declare const getAllApprovalWorkflows: (filters?: {
    isActive?: boolean;
}) => Promise<ApprovalWorkflow[]>;
/**
 * Get approval workflow by ID
 */
export declare const getApprovalWorkflowById: (workflowId: string) => Promise<ApprovalWorkflow>;
/**
 * Update approval workflow
 */
export declare const updateApprovalWorkflow: (workflowId: string, workflowData: Partial<ApprovalWorkflow>) => Promise<ApprovalWorkflow>;
/**
 * Delete approval workflow
 */
export declare const deleteApprovalWorkflow: (workflowId: string) => Promise<void>;
/**
 * Get approval workflow for leave duration
 */
export declare const getApprovalWorkflowForDuration: (days: number) => Promise<ApprovalWorkflow>;
