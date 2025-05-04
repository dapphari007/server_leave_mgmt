import { LeaveBalance } from '../models';
/**
 * Create a new leave balance
 */
export declare const createLeaveBalance: (leaveBalanceData: Partial<LeaveBalance>) => Promise<LeaveBalance>;
/**
 * Get all leave balances with optional filters
 */
export declare const getAllLeaveBalances: (filters?: {
    userId?: string;
    leaveTypeId?: string;
    year?: number;
}) => Promise<LeaveBalance[]>;
/**
 * Get leave balance by ID
 */
export declare const getLeaveBalanceById: (leaveBalanceId: string) => Promise<LeaveBalance>;
/**
 * Get leave balances for a user
 */
export declare const getUserLeaveBalances: (userId: string, year?: number) => Promise<LeaveBalance[]>;
/**
 * Update leave balance
 */
export declare const updateLeaveBalance: (leaveBalanceId: string, leaveBalanceData: Partial<LeaveBalance>) => Promise<LeaveBalance>;
/**
 * Delete leave balance
 */
export declare const deleteLeaveBalance: (leaveBalanceId: string) => Promise<void>;
/**
 * Bulk create leave balances for all users
 */
export declare const bulkCreateLeaveBalances: (leaveTypeId: string, year: number, resetExisting?: boolean) => Promise<number>;
/**
 * Process carry forward for all users
 */
export declare const processCarryForward: (fromYear: number, toYear: number) => Promise<number>;
