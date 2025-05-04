import { LeaveType } from '../models';
/**
 * Create a new leave type
 */
export declare const createLeaveType: (leaveTypeData: Partial<LeaveType>) => Promise<LeaveType>;
/**
 * Get all leave types with optional filters
 */
export declare const getAllLeaveTypes: (filters?: {
    isActive?: boolean;
}) => Promise<LeaveType[]>;
/**
 * Get leave type by ID
 */
export declare const getLeaveTypeById: (leaveTypeId: string) => Promise<LeaveType>;
/**
 * Update leave type
 */
export declare const updateLeaveType: (leaveTypeId: string, leaveTypeData: Partial<LeaveType>) => Promise<LeaveType>;
/**
 * Delete leave type
 */
export declare const deleteLeaveType: (leaveTypeId: string) => Promise<void>;
