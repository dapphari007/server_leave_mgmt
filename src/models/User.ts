import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { LeaveRequest } from "./LeaveRequest";
import { LeaveBalance } from "./LeaveBalance";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  MANAGER = "manager",
  HR = "hr",
  TEAM_LEAD = "team_lead",
  EMPLOYEE = "employee",
}

export enum UserLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: "enum",
    enum: UserRole,
    enumName: "user_role_enum",
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserLevel,
    enumName: "user_level_enum",
    default: UserLevel.LEVEL_1,
  })
  level: UserLevel;

  @Column({
    type: "enum",
    enum: Gender,
    enumName: "gender_enum",
    nullable: true,
  })
  gender: Gender;

  @Column({ nullable: true })
  managerId: string;

  @Column({ nullable: true, length: 100 })
  department: string;

  @Column({ nullable: true, length: 100 })
  position: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
  leaveRequests: LeaveRequest[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.approver)
  approvedLeaveRequests: LeaveRequest[];

  @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.user)
  leaveBalances: LeaveBalance[];
}
