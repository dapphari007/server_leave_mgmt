import { User } from './User';
import { LeaveType } from './LeaveType';
export declare class LeaveBalance {
    id: string;
    user: User;
    userId: string;
    leaveType: LeaveType;
    leaveTypeId: string;
    balance: number;
    used: number;
    carryForward: number;
    year: number;
    createdAt: Date;
    updatedAt: Date;
}
