import { DataSource } from "typeorm";
import config from "./config";
import path from "path";
import logger from "../utils/logger";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false, // Disable auto-synchronization to prevent data loss
  logging: false, // Disable SQL logging
  entities: [path.join(__dirname, "../models/**/*.{ts,js}")],
  migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
  subscribers: [path.join(__dirname, "../subscribers/**/*.{ts,js}")],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    // If the connection is already established, close it first
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    // Initialize the connection
    await AppDataSource.initialize();
    logger.info("Database connected successfully");

    // Check if tables exist but don't create or modify them
    // This preserves existing data including HR, managers, and leave types
    const tableExists = async (tableName: string): Promise<boolean> => {
      try {
        const result = await AppDataSource.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [tableName]
        );
        return result[0].exists;
      } catch (err) {
        return false;
      }
    };

    // Get all entity metadata
    const entities = AppDataSource.entityMetadatas;

    // Check tables but don't modify them
    for (const entity of entities) {
      const exists = await tableExists(entity.tableName);
      if (!exists) {
        logger.warn(`* Table ${entity.tableName} does not exist. Run migrations to create it.`);
      }
    }
    
    logger.info("* Database check completed, preserving all existing data");
  } catch (error) {
    logger.error("Error during database initialization:", error);
    throw error;
  }
};
