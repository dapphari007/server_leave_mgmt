import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartmentAndPositionToUsers1700000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "department" character varying(100),
      ADD COLUMN IF NOT EXISTS "position" character varying(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "department",
      DROP COLUMN IF EXISTS "position"
    `);
  }
}
