"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationErrorHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Global error handler middleware
 */
const errorHandler = async (request, h, err) => {
    if (err) {
        // Log the error
        logger_1.default.error(`Unhandled error: ${err.message}`, {
            stack: err.stack,
            path: request.path,
            method: request.method,
        });
        // Return a generic error response
        return h.response({
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
        }).code(500);
    }
    return h.continue;
};
exports.errorHandler = errorHandler;
/**
 * Not found handler middleware
 */
const notFoundHandler = (request, h) => {
    return h.response({
        statusCode: 404,
        error: 'Not Found',
        message: 'The requested resource was not found',
    }).code(404);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Validation error handler middleware
 */
const validationErrorHandler = (request, h, err) => {
    if (err.name === 'ValidationError') {
        return h.response({
            statusCode: 400,
            error: 'Bad Request',
            message: err.message,
        }).code(400);
    }
    return h.continue;
};
exports.validationErrorHandler = validationErrorHandler;
//# sourceMappingURL=errorMiddleware.js.map