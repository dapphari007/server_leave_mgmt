import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateApprovalWorkflowSchema1715400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // We don't need to modify the column structure since it's a JSONB column
    // We just need to update the data format
    
    // Get all existing approval workflows
    const workflows = await queryRunner.query(`
      SELECT id, "approvalLevels" FROM approval_workflows
    `);
    
    // Update each workflow to include the new fields
    for (const workflow of workflows) {
      try {
        const approvalLevels = workflow.approvalLevels;
        
        // Convert each level to the new format
        const updatedLevels = approvalLevels.map((level: any) => {
          let approverType = "";
          
          // Determine approverType based on roles
          if (level.roles.includes("team_lead")) {
            approverType = "teamLead";
          } else if (level.roles.includes("manager")) {
            approverType = "manager";
          } else if (level.roles.includes("hr")) {
            approverType = "hr";
          } else if (level.roles.includes("super_admin")) {
            approverType = "superAdmin";
          }
          
          return {
            level: level.level,
            roles: level.roles, // Keep for backward compatibility
            approverType,
            fallbackRoles: level.roles
          };
        });
        
        // Update the workflow with the new format
        await queryRunner.query(`
          UPDATE approval_workflows
          SET "approvalLevels" = $1
          WHERE id = $2
        `, [JSON.stringify(updatedLevels), workflow.id]);
      } catch (error) {
        console.error(`Error updating workflow ${workflow.id}:`, error);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get all existing approval workflows
    const workflows = await queryRunner.query(`
      SELECT id, "approvalLevels" FROM approval_workflows
    `);
    
    // Revert each workflow to the old format
    for (const workflow of workflows) {
      try {
        const approvalLevels = workflow.approvalLevels;
        
        // Convert each level back to the old format
        const revertedLevels = approvalLevels.map((level: any) => {
          return {
            level: level.level,
            roles: level.roles || level.fallbackRoles
          };
        });
        
        // Update the workflow with the old format
        await queryRunner.query(`
          UPDATE approval_workflows
          SET "approvalLevels" = $1
          WHERE id = $2
        `, [JSON.stringify(revertedLevels), workflow.id]);
      } catch (error) {
        console.error(`Error reverting workflow ${workflow.id}:`, error);
      }
    }
  }
}