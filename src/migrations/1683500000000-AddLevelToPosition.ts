import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLevelToPosition1683500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First check if the positions table exists
        const tableExists = await queryRunner.hasTable('positions');
        
        if (!tableExists) {
            console.log('Positions table does not exist yet. Skipping this migration.');
            return;
        }
        
        // Check if the level column already exists
        const hasLevelColumn = await queryRunner.hasColumn('positions', 'level');
        
        if (!hasLevelColumn) {
            // Add level column with default value 1
            await queryRunner.query(`ALTER TABLE "positions" ADD "level" integer DEFAULT 1`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // First check if the positions table exists
        const tableExists = await queryRunner.hasTable('positions');
        
        if (!tableExists) {
            return;
        }
        
        // Check if the level column exists before trying to remove it
        const hasLevelColumn = await queryRunner.hasColumn('positions', 'level');
        
        if (hasLevelColumn) {
            await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "level"`);
        }
    }
}