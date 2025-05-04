import { DataSource } from "typeorm";
import config from "./config";
import path from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.server.nodeEnv === "development",
  logging: config.server.nodeEnv === "development",
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

    // In development mode, drop the schema and synchronize
    if (config.server.nodeEnv === "development") {
      // Drop the schema
      await AppDataSource.dropDatabase();

      // Synchronize the schema
      await AppDataSource.synchronize();
    }

    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Error during database initialization:", error);
    throw error;
  }
};
