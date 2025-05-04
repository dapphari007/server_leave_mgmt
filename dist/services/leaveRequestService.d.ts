import { LeaveRequest, LeaveRequestStatus, ApprovalWorkflow } from "../models";
/**
 * Create a new leave request
 */
export declare const createLeaveRequest: (userId: string, leaveRequestData: Partial<LeaveRequest>) => Promise<LeaveRequest>;
/**
 * Get all leave requests with optional filters
 */
export declare const getAllLeaveRequests: (filters?: {
    userId?: string;
    status?: LeaveRequestStatus;
    startDate?: Date;
    endDate?: Date;
}) => Promise<LeaveRequest[]>;
/**
 * Get leave request by ID
 */
export declare const getLeaveRequestById: (leaveRequestId: string) => Promise<LeaveRequest>;
/**
 * Get leave requests for a user
 */
export declare const getUserLeaveRequests: (userId: string, filters?: {
    status?: LeaveRequestStatus;
    year?: number;
}) => Promise<LeaveRequest[]>;
/**
 * Get leave requests for a manager's team
 */
export declare const getManagerLeaveRequests: (managerId: string, filters?: {
    status?: LeaveRequestStatus;
    startDate?: Date;
    endDate?: Date;
}) => Promise<LeaveRequest[]>;
/**
 * Update leave request status
 */
export declare const updateLeaveRequestStatus: (leaveRequestId: string, status: LeaveRequestStatus, approverId: string, comments?: string) => Promise<LeaveRequest>;
/**
 * Cancel leave request
 */
export declare const cancelLeaveRequest: (leaveRequestId: string, userId: string) => Promise<LeaveRequest>;
/**
 * Get approval workflow for leave request
 */
export declare const getApprovalWorkflow: (numberOfDays: number) => Promise<ApprovalWorkflow>;
