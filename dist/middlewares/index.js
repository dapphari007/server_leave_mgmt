"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas = exports.registerMiddlewares = void 0;
const errorMiddleware_1 = require("./errorMiddleware");
const authMiddleware_1 = require("./authMiddleware");
const validationSchemas = __importStar(require("./validationMiddleware"));
exports.validationSchemas = validationSchemas;
/**
 * Register all middlewares
 */
const registerMiddlewares = (server) => {
    // Register error handlers
    server.ext('onPreResponse', errorMiddleware_1.errorHandler);
    // Register authentication strategies
    server.auth.strategy('all_roles', 'jwt', authMiddleware_1.allRolesAuth.options);
    server.auth.strategy('super_admin', 'jwt', authMiddleware_1.superAdminAuth.options);
    server.auth.strategy('manager_hr', 'jwt', authMiddleware_1.managerHrAuth.options);
    server.auth.strategy('manager', 'jwt', authMiddleware_1.managerAuth.options);
    server.auth.strategy('hr', 'jwt', authMiddleware_1.hrAuth.options);
    // Set default authentication strategy
    server.auth.default('all_roles');
};
exports.registerMiddlewares = registerMiddlewares;
//# sourceMappingURL=index.js.map