import { MigrationInterface, QueryRunner } from "typeorm";
import { UserRole } from "../models/User";

export class AddDepartmentSpecificApprovalWorkflows1715600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a new department-specific approval workflow
    await queryRunner.query(`
      INSERT INTO approval_workflows (
        id, 
        name, 
        min_days, 
        max_days, 
        approval_levels, 
        is_active, 
        created_at, 
        updated_at
      ) 
      VALUES (
        uuid_generate_v4(), 
        'Department-Based Approval Workflow', 
        1, 
        30, 
        '[
          {
            "level": 1,
            "approverType": "teamLead",
            "fallbackRoles": ["team_lead"]
          },
          {
            "level": 2,
            "approverType": "departmentHead",
            "fallbackRoles": ["manager"]
          },
          {
            "level": 3,
            "approverType": "hr",
            "fallbackRoles": ["hr"]
          }
        ]'::jsonb, 
        true, 
        NOW(), 
        NOW()
      )
    `);

    // Update existing approval workflows to include department-specific approvers
    await queryRunner.query(`
      UPDATE approval_workflows
      SET approval_levels = jsonb_set(
        approval_levels,
        '{0}',
        jsonb_build_object(
          'level', (approval_levels->0->>'level')::int,
          'approverType', 'teamLead',
          'fallbackRoles', ARRAY['team_lead']::text[]
        )::jsonb
      )
      WHERE name = 'Standard Approval Workflow'
    `);

    await queryRunner.query(`
      UPDATE approval_workflows
      SET approval_levels = jsonb_set(
        approval_levels,
        '{1}',
        jsonb_build_object(
          'level', (approval_levels->1->>'level')::int,
          'approverType', 'departmentHead',
          'fallbackRoles', ARRAY['manager']::text[]
        )::jsonb
      )
      WHERE name = 'Standard Approval Workflow' AND jsonb_array_length(approval_levels) > 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the department-specific workflow
    await queryRunner.query(`
      DELETE FROM approval_workflows
      WHERE name = 'Department-Based Approval Workflow'
    `);

    // Revert changes to existing workflows
    await queryRunner.query(`
      UPDATE approval_workflows
      SET approval_levels = jsonb_set(
        approval_levels,
        '{0}',
        jsonb_build_object(
          'level', (approval_levels->0->>'level')::int,
          'roles', ARRAY['team_lead']::text[]
        )::jsonb
      )
      WHERE name = 'Standard Approval Workflow'
    `);

    await queryRunner.query(`
      UPDATE approval_workflows
      SET approval_levels = jsonb_set(
        approval_levels,
        '{1}',
        jsonb_build_object(
          'level', (approval_levels->1->>'level')::int,
          'roles', ARRAY['manager']::text[]
        )::jsonb
      )
      WHERE name = 'Standard Approval Workflow' AND jsonb_array_length(approval_levels) > 1
    `);
  }
}