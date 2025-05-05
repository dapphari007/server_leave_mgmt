import { AppDataSource } from "../config/database";
import logger from "../utils/logger";

/**
 * Script to run pending migrations
 */
const runMigrations = async () => {
  try {
    // Initialize the connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connected successfully");
    }

    // Check for pending migrations
    const pendingMigrations = await AppDataSource.showMigrations();
    
    if (pendingMigrations) {
      logger.info("Running pending migrations...");
      await AppDataSource.runMigrations();
      logger.info("Migrations completed successfully");
    } else {
      logger.info("No pending migrations to run");
    }

    // Close the connection
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error("Error running migrations:", error);
    process.exit(1);
  }
};

// Run the script
runMigrations();