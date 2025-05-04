import { LeaveRequest } from "./LeaveRequest";
import { LeaveBalance } from "./LeaveBalance";
export declare class LeaveType {
    id: string;
    name: string;
    description: string;
    defaultDays: number;
    isCarryForward: boolean;
    maxCarryForwardDays: number;
    isActive: boolean;
    applicableGender: string | null;
    isHalfDayAllowed: boolean;
    isPaidLeave: boolean;
    createdAt: Date;
    updatedAt: Date;
    leaveRequests: LeaveRequest[];
    leaveBalances: LeaveBalance[];
}
