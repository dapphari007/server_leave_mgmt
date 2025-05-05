import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class EnsureUserRelationColumns1715000000001 implements MigrationInterface {
  name = "EnsureUserRelationColumns1715000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const tableExists = await queryRunner.hasTable("users");
    if (!tableExists) {
      console.log("Users table does not exist yet, skipping column additions");
      return;
    }

    // Get the users table
    const table = await queryRunner.getTable("users");
    
    // Check and add roleId column if it doesn't exist
    const roleIdColumn = table.findColumnByName("roleId");
    if (!roleIdColumn) {
      await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roleId" uuid NULL
      `);
      console.log("Added roleId column to users table");
    }
    
    // Check and add departmentId column if it doesn't exist
    const departmentIdColumn = table.findColumnByName("departmentId");
    if (!departmentIdColumn) {
      await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "departmentId" uuid NULL
      `);
      console.log("Added departmentId column to users table");
    }
    
    // Check and add positionId column if it doesn't exist
    const positionIdColumn = table.findColumnByName("positionId");
    if (!positionIdColumn) {
      await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "positionId" uuid NULL
      `);
      console.log("Added positionId column to users table");
    }
    
    // Add foreign key constraints if they don't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Check if roles table exists
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'roles' AND table_schema = 'public'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'FK_users_roles' 
          AND table_name = 'users'
        ) THEN
          BEGIN
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_roles" 
            FOREIGN KEY ("roleId") 
            REFERENCES "roles"("id") 
            ON DELETE SET NULL;
          EXCEPTION
            WHEN others THEN
              RAISE NOTICE 'Could not add FK_users_roles constraint: %', SQLERRM;
          END;
        END IF;
        
        -- Check if departments table exists
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'departments' AND table_schema = 'public'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'FK_users_departments' 
          AND table_name = 'users'
        ) THEN
          BEGIN
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_departments" 
            FOREIGN KEY ("departmentId") 
            REFERENCES "departments"("id") 
            ON DELETE SET NULL;
          EXCEPTION
            WHEN others THEN
              RAISE NOTICE 'Could not add FK_users_departments constraint: %', SQLERRM;
          END;
        END IF;
        
        -- Check if positions table exists
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'positions' AND table_schema = 'public'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'FK_users_positions' 
          AND table_name = 'users'
        ) THEN
          BEGIN
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_positions" 
            FOREIGN KEY ("positionId") 
            REFERENCES "positions"("id") 
            ON DELETE SET NULL;
          EXCEPTION
            WHEN others THEN
              RAISE NOTICE 'Could not add FK_users_positions constraint: %', SQLERRM;
          END;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This is a safety migration, no need to implement down
  }
}