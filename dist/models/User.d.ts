import { LeaveRequest } from "./LeaveRequest";
import { LeaveBalance } from "./LeaveBalance";
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    MANAGER = "manager",
    HR = "hr",
    EMPLOYEE = "employee"
}
export declare enum UserLevel {
    LEVEL_1 = 1,
    LEVEL_2 = 2,
    LEVEL_3 = 3,
    LEVEL_4 = 4
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    role: UserRole;
    level: UserLevel;
    gender: Gender;
    managerId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    leaveRequests: LeaveRequest[];
    approvedLeaveRequests: LeaveRequest[];
    leaveBalances: LeaveBalance[];
}
