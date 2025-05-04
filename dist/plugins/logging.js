"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingPlugin = void 0;
const boom_1 = require("@hapi/boom");
const logger_1 = __importDefault(require("../utils/logger"));
exports.loggingPlugin = {
    name: "logging",
    version: "1.0.0",
    register: async function (server) {
        // Log all requests
        server.ext("onRequest", (request, h) => {
            const { method, path, headers } = request;
            logger_1.default.info(`Request: ${method.toUpperCase()} ${path} - Headers: ${JSON.stringify(headers)}`);
            return h.continue;
        });
        // Log all responses
        server.ext("onPreResponse", (request, h) => {
            const response = request.response;
            let statusCode;
            let errorPayload;
            if (response instanceof boom_1.Boom) {
                statusCode = response.output?.statusCode || 500;
                errorPayload = response.output?.payload;
            }
            else {
                statusCode = response.statusCode || 200;
                errorPayload = response.source;
            }
            const responseTime = Date.now() - request.info.received;
            if (statusCode >= 400) {
                logger_1.default.error(`Response: ${request.method.toUpperCase()} ${request.path} - Status: ${statusCode} - Time: ${responseTime}ms - Error: ${JSON.stringify(errorPayload)}`);
            }
            else {
                logger_1.default.info(`Response: ${request.method.toUpperCase()} ${request.path} - Status: ${statusCode} - Time: ${responseTime}ms`);
            }
            return h.continue;
        });
        // Log server errors
        server.events.on({ name: "request", channels: "error" }, (request, event, tags) => {
            if (tags.error) {
                const errorObj = event.error;
                logger_1.default.error(`Server error: ${errorObj?.message || "Unknown error"}`);
                if (errorObj?.stack) {
                    logger_1.default.error(`Stack: ${errorObj.stack}`);
                }
            }
        });
        logger_1.default.info("Logging plugin registered");
    },
};
//# sourceMappingURL=logging.js.map