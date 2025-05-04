"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrAuth = exports.managerAuth = exports.managerHrAuth = exports.superAdminAuth = exports.allRolesAuth = void 0;
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Authentication strategy for all roles
 */
exports.allRolesAuth = {
    name: 'all_roles',
    scheme: 'jwt',
    options: {
        key: process.env.JWT_SECRET || 'your_jwt_secret_key',
        validate: async (decoded, request, h) => {
            try {
                // Decoded token contains user information
                return { isValid: true, credentials: decoded };
            }
            catch (error) {
                logger_1.default.error(`Error validating token: ${error}`);
                return { isValid: false };
            }
        },
        verifyOptions: { algorithms: ['HS256'] },
    },
};
/**
 * Authentication strategy for super admin only
 */
exports.superAdminAuth = {
    name: 'super_admin',
    scheme: 'jwt',
    options: {
        key: process.env.JWT_SECRET || 'your_jwt_secret_key',
        validate: async (decoded, request, h) => {
            try {
                // Check if user is a super admin
                if (decoded.role !== models_1.UserRole.SUPER_ADMIN) {
                    return { isValid: false };
                }
                return { isValid: true, credentials: decoded };
            }
            catch (error) {
                logger_1.default.error(`Error validating token: ${error}`);
                return { isValid: false };
            }
        },
        verifyOptions: { algorithms: ['HS256'] },
    },
};
/**
 * Authentication strategy for managers and HR
 */
exports.managerHrAuth = {
    name: 'manager_hr',
    scheme: 'jwt',
    options: {
        key: process.env.JWT_SECRET || 'your_jwt_secret_key',
        validate: async (decoded, request, h) => {
            try {
                // Check if user is a manager, HR, or super admin
                if (decoded.role !== models_1.UserRole.MANAGER &&
                    decoded.role !== models_1.UserRole.HR &&
                    decoded.role !== models_1.UserRole.SUPER_ADMIN) {
                    return { isValid: false };
                }
                return { isValid: true, credentials: decoded };
            }
            catch (error) {
                logger_1.default.error(`Error validating token: ${error}`);
                return { isValid: false };
            }
        },
        verifyOptions: { algorithms: ['HS256'] },
    },
};
/**
 * Authentication strategy for managers only
 */
exports.managerAuth = {
    name: 'manager',
    scheme: 'jwt',
    options: {
        key: process.env.JWT_SECRET || 'your_jwt_secret_key',
        validate: async (decoded, request, h) => {
            try {
                // Check if user is a manager or super admin
                if (decoded.role !== models_1.UserRole.MANAGER &&
                    decoded.role !== models_1.UserRole.SUPER_ADMIN) {
                    return { isValid: false };
                }
                return { isValid: true, credentials: decoded };
            }
            catch (error) {
                logger_1.default.error(`Error validating token: ${error}`);
                return { isValid: false };
            }
        },
        verifyOptions: { algorithms: ['HS256'] },
    },
};
/**
 * Authentication strategy for HR only
 */
exports.hrAuth = {
    name: 'hr',
    scheme: 'jwt',
    options: {
        key: process.env.JWT_SECRET || 'your_jwt_secret_key',
        validate: async (decoded, request, h) => {
            try {
                // Check if user is HR or super admin
                if (decoded.role !== models_1.UserRole.HR &&
                    decoded.role !== models_1.UserRole.SUPER_ADMIN) {
                    return { isValid: false };
                }
                return { isValid: true, credentials: decoded };
            }
            catch (error) {
                logger_1.default.error(`Error validating token: ${error}`);
                return { isValid: false };
            }
        },
        verifyOptions: { algorithms: ['HS256'] },
    },
};
//# sourceMappingURL=authMiddleware.js.map