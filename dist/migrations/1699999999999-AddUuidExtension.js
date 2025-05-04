"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUuidExtension1699999999999 = void 0;
class AddUuidExtension1699999999999 {
    constructor() {
        this.name = "AddUuidExtension1699999999999";
    }
    async up(queryRunner) {
        // Add UUID extension for PostgreSQL
        await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    }
    async down(queryRunner) {
        // Drop UUID extension
        await queryRunner.query(`
      DROP EXTENSION IF EXISTS "uuid-ossp";
    `);
    }
}
exports.AddUuidExtension1699999999999 = AddUuidExtension1699999999999;
//# sourceMappingURL=1699999999999-AddUuidExtension.js.map