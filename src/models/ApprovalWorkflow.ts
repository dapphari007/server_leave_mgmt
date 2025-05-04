import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserRole } from "./User";

@Entity("approval_workflows")
export class ApprovalWorkflow {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "int" })
  minDays: number;

  @Column({ type: "int" })
  maxDays: number;

  @Column({ type: "jsonb" })
  approvalLevels: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
