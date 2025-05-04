import Hapi from "@hapi/hapi";
import Joi from "joi";
import { registerPlugins } from "./plugins";
import { registerRoutes } from "./routes";
import { initializeDatabase } from "./config/database";
import config from "./config/config";
import logger from "./utils/logger";

const init = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Create Hapi server
    const server = Hapi.server({
      port: config.server.port,
      host: config.server.host,
      routes: {
        cors: {
          origin: ["*"],
          credentials: true,
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

    // Start server
    await server.start();
    logger.info(`Server running on ${server.info.uri}`);

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled rejection:", err);
      process.exit(1);
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
