import Hapi from "@hapi/hapi";
import Joi from "joi";
import { registerPlugins } from "./plugins";
import { registerRoutes } from "./routes";
import {
  initializeDatabase,
  ensureDatabaseConnection,
  AppDataSource,
} from "./config/database";
import config from "./config/config";
import logger from "./utils/logger";
import { ensureDefaultUsers } from "./utils/ensure-default-users";
import { createDefaultLeaveTypes } from "./scripts/createDefaultLeaveTypes";
import { createHolidays2025 } from "./scripts/createHolidays2025";

const init = async () => {
  try {
    // Initialize database connection with retry mechanism
    let retries = 5;
    while (retries > 0) {
      try {
        await initializeDatabase();
        logger.info("Database connected successfully");
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        logger.warn(
          `Database connection failed, retrying... (${retries} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds before retrying
      }
    }

    // Create Hapi server
    const server = Hapi.server({
      port: config.server.port,
      host: config.server.host,
      routes: {
        cors: {
          origin: ["*"],
          credentials: true,
          additionalHeaders: ["Authorization", "Content-Type"],
          additionalExposedHeaders: ["Authorization"],
          maxAge: 86400, // 24 hours
        },
        validate: {
          failAction: async (request, h, err) => {
            const error = err as Error;
            if (process.env.NODE_ENV === "production") {
              // In production, log the error but return a generic message
              logger.error(
                `Validation error: ${error?.message || "Unknown error"}`
              );
              throw new Error(`Invalid request payload input`);
            } else {
              // During development, log and respond with the full error
              logger.error(
                `Validation error: ${error?.message || "Unknown error"}`
              );
              throw error;
            }
          },
        },
      },
    });

    // Register plugins
    await registerPlugins(server);

    // Register routes
    registerRoutes(server);

    // Ensure default users exist (including superadmin, managers, HR, and employees)
    await ensureDefaultUsers();
    console.log("Default users check completed");

    // Create default leave types
    try {
      await createDefaultLeaveTypes();
      console.log("Default leave types check completed");
    } catch (error) {
      logger.error("Error creating default leave types:", error);
    }

    // Create holidays for 2025
    try {
      await createHolidays2025();
      console.log("2025 holidays check completed");
    } catch (error) {
      logger.error("Error creating 2025 holidays:", error);
    }

    // Set up database connection health check
    const dbHealthCheck = setInterval(async () => {
      try {
        if (!AppDataSource.isInitialized) {
          logger.warn("Database connection lost, attempting to reconnect...");
          await ensureDatabaseConnection();
        } else {
          // Test the connection with a simple query
          try {
            await AppDataSource.query("SELECT 1");
          } catch (error) {
            logger.warn("Database connection test failed, reconnecting...");
            await ensureDatabaseConnection();
          }
        }
      } catch (error) {
        logger.error("Database health check failed:", error);
      }
    }, 30000); // Check every 30 seconds

    // Start server
    await server.start();
    logger.info(`Server running on ${server.info.uri}`);

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled rejection:", err);
      clearInterval(dbHealthCheck);
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Shutting down server...");
      await server.stop();
      clearInterval(dbHealthCheck);
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
      process.exit(0);
    });

    return server;
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  init();
}

export default init;
