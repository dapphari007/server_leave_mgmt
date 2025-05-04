"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugins = void 0;
const boom_1 = require("@hapi/boom");
const auth_1 = require("./auth");
const logging_1 = require("./logging");
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const registerPlugins = async (server) => {
    // Register plugins
    await server.register([
        auth_1.authPlugin,
        logging_1.loggingPlugin,
    ]);
    // Register error handlers
    server.ext('onPreResponse', errorMiddleware_1.errorHandler);
    // Register not found handler
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response instanceof boom_1.Boom && response.output?.statusCode === 404) {
            return (0, errorMiddleware_1.notFoundHandler)(request, h);
        }
        return h.continue;
    });
    // Register validation error handler
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response instanceof boom_1.Boom && response.output?.statusCode === 400) {
            return (0, errorMiddleware_1.validationErrorHandler)(request, h, response);
        }
        return h.continue;
    });
};
exports.registerPlugins = registerPlugins;
//# sourceMappingURL=index.js.map