import { User } from "./User";
import { LeaveType } from "./LeaveType";
export declare enum LeaveRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare enum LeaveRequestType {
    FULL_DAY = "full_day",
    HALF_DAY_MORNING = "half_day_morning",
    HALF_DAY_AFTERNOON = "half_day_afternoon"
}
export declare class LeaveRequest {
    id: string;
    user: User;
    userId: string;
    leaveType: LeaveType;
    leaveTypeId: string;
    startDate: Date;
    endDate: Date;
    requestType: LeaveRequestType;
    numberOfDays: number;
    reason: string;
    status: LeaveRequestStatus;
    approver: User;
    approverId: string;
    approverComments: string;
    approvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
