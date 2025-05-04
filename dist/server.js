"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hapi_1 = __importDefault(require("@hapi/hapi"));
const plugins_1 = require("./plugins");
const routes_1 = require("./routes");
const database_1 = require("./config/database");
const config_1 = __importDefault(require("./config/config"));
const logger_1 = __importDefault(require("./utils/logger"));
const init = async () => {
    try {
        // Initialize database connection
        await (0, database_1.initializeDatabase)();
        // Create Hapi server
        const server = hapi_1.default.server({
            port: config_1.default.server.port,
            host: config_1.default.server.host,
            routes: {
                cors: {
                    origin: ["*"],
                    credentials: true,
                },
                validate: {
                    failAction: async (request, h, err) => {
                        const error = err;
                        if (process.env.NODE_ENV === "production") {
                            // In production, log the error but return a generic message
                            logger_1.default.error(`Validation error: ${error?.message || "Unknown error"}`);
                            throw new Error(`Invalid request payload input`);
                        }
                        else {
                            // During development, log and respond with the full error
                            logger_1.default.error(`Validation error: ${error?.message || "Unknown error"}`);
                            throw error;
                        }
                    },
                },
            },
        });
        // Register plugins
        await (0, plugins_1.registerPlugins)(server);
        // Register routes
        (0, routes_1.registerRoutes)(server);
        // Start server
        await server.start();
        logger_1.default.info(`Server running on ${server.info.uri}`);
        // Handle unhandled rejections
        process.on("unhandledRejection", (err) => {
            logger_1.default.error("Unhandled rejection:", err);
            process.exit(1);
        });
        return server;
    }
    catch (error) {
        logger_1.default.error("Error starting server:", error);
        process.exit(1);
    }
};
// Start the server
if (require.main === module) {
    init();
}
exports.default = init;
//# sourceMappingURL=server.js.map