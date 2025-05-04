"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = __importDefault(require("./config"));
const path_1 = __importDefault(require("path"));
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: config_1.default.database.host,
    port: config_1.default.database.port,
    username: config_1.default.database.username,
    password: config_1.default.database.password,
    database: config_1.default.database.database,
    synchronize: config_1.default.server.nodeEnv === "development",
    logging: config_1.default.server.nodeEnv === "development",
    entities: [path_1.default.join(__dirname, "../models/**/*.{ts,js}")],
    migrations: [path_1.default.join(__dirname, "../migrations/**/*.{ts,js}")],
    subscribers: [path_1.default.join(__dirname, "../subscribers/**/*.{ts,js}")],
});
const initializeDatabase = async () => {
    try {
        // If the connection is already established, close it first
        if (exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.destroy();
        }
        // Initialize the connection
        await exports.AppDataSource.initialize();
        // In development mode, drop the schema and synchronize
        if (config_1.default.server.nodeEnv === "development") {
            // Drop the schema
            await exports.AppDataSource.dropDatabase();
            // Synchronize the schema
            await exports.AppDataSource.synchronize();
        }
        console.log("Database connection established successfully");
    }
    catch (error) {
        console.error("Error during database initialization:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=database.js.map