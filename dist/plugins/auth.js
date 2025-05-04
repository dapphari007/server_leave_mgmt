"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authPlugin = void 0;
const jwt_1 = __importDefault(require("@hapi/jwt"));
const models_1 = require("../models");
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../utils/logger"));
exports.authPlugin = {
    name: "auth",
    version: "1.0.0",
    register: async function (server) {
        await server.register(jwt_1.default);
        server.auth.strategy("jwt", "jwt", {
            keys: config_1.default.jwt.secret,
            verify: {
                aud: false,
                iss: false,
                sub: false,
                maxAgeSec: 14 * 24 * 60 * 60, // 14 days
            },
            validate: async (artifacts) => {
                try {
                    const { decoded } = artifacts;
                    const { payload } = decoded;
                    if (!payload || !payload.id) {
                        return { isValid: false };
                    }
                    // You can add additional validation here, like checking if the user exists in the database
                    return {
                        isValid: true,
                        credentials: {
                            id: payload.id,
                            email: payload.email,
                            role: payload.role,
                            level: payload.level,
                        },
                    };
                }
                catch (error) {
                    logger_1.default.error(`Auth validation error: ${error}`);
                    return { isValid: false };
                }
            },
        });
        server.auth.default("jwt");
        // Create a scheme for role-based access control
        server.auth.scheme("role-based", (server, options) => {
            return {
                authenticate: async (request, h) => {
                    try {
                        // First, authenticate using JWT
                        const { credentials } = await server.auth.test("jwt", request);
                        // If roles are specified, check if the user has the required role
                        if (options.roles && options.roles.length > 0) {
                            const userRole = credentials.role;
                            if (!options.roles.includes(userRole)) {
                                return h.unauthenticated(new Error("Insufficient permissions to access this resource"));
                            }
                        }
                        return h.authenticated({ credentials });
                    }
                    catch (error) {
                        return h.unauthenticated(error);
                    }
                },
            };
        });
        // Create strategies for different roles
        server.auth.strategy("super_admin", "role-based", {
            roles: [models_1.UserRole.SUPER_ADMIN],
        });
        server.auth.strategy("manager", "role-based", {
            roles: [models_1.UserRole.SUPER_ADMIN, models_1.UserRole.MANAGER],
        });
        server.auth.strategy("hr", "role-based", {
            roles: [models_1.UserRole.SUPER_ADMIN, models_1.UserRole.HR],
        });
        server.auth.strategy("manager_hr", "role-based", {
            roles: [models_1.UserRole.SUPER_ADMIN, models_1.UserRole.MANAGER, models_1.UserRole.HR],
        });
        server.auth.strategy("all_roles", "role-based", {
            roles: [
                models_1.UserRole.SUPER_ADMIN,
                models_1.UserRole.MANAGER,
                models_1.UserRole.HR,
                models_1.UserRole.EMPLOYEE,
            ],
        });
        logger_1.default.info("Auth plugin registered");
    },
};
//# sourceMappingURL=auth.js.map