"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalWorkflowValidation = exports.holidayValidation = exports.leaveRequestValidation = exports.leaveBalanceValidation = exports.leaveTypeValidation = exports.authValidation = exports.userValidation = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * User validation schemas
 */
exports.userValidation = {
    create: joi_1.default.object({
        firstName: joi_1.default.string().required(),
        lastName: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        phoneNumber: joi_1.default.string().allow("", null),
        address: joi_1.default.string().allow("", null),
        role: joi_1.default.string()
            .valid("super_admin", "hr", "manager", "employee")
            .default("employee"),
        level: joi_1.default.number().integer().min(1).max(4).default(1),
        gender: joi_1.default.string().valid("male", "female", "other").required(),
        managerId: joi_1.default.string().uuid().allow(null),
        isActive: joi_1.default.boolean().default(true),
    }),
    update: joi_1.default.object({
        firstName: joi_1.default.string(),
        lastName: joi_1.default.string(),
        email: joi_1.default.string().email(),
        phoneNumber: joi_1.default.string().allow("", null),
        address: joi_1.default.string().allow("", null),
        role: joi_1.default.string().valid("super_admin", "hr", "manager", "employee"),
        level: joi_1.default.number().integer().min(1).max(4),
        gender: joi_1.default.string().valid("male", "female", "other"),
        managerId: joi_1.default.string().uuid().allow(null),
        isActive: joi_1.default.boolean(),
    }),
    changePassword: joi_1.default.object({
        currentPassword: joi_1.default.string().required(),
        newPassword: joi_1.default.string().min(8).required(),
    }),
    resetPassword: joi_1.default.object({
        newPassword: joi_1.default.string().min(8).required(),
    }),
};
/**
 * Authentication validation schemas
 */
exports.authValidation = {
    register: exports.userValidation.create,
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    }),
    updateProfile: joi_1.default.object({
        firstName: joi_1.default.string(),
        lastName: joi_1.default.string(),
        phoneNumber: joi_1.default.string().allow("", null),
        address: joi_1.default.string().allow("", null),
    }),
};
/**
 * Leave type validation schemas
 */
exports.leaveTypeValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
        defaultDays: joi_1.default.number().integer().min(0).required(),
        isCarryForward: joi_1.default.boolean().default(false),
        maxCarryForwardDays: joi_1.default.number().integer().min(0).default(0),
        isActive: joi_1.default.boolean().default(true),
        applicableGender: joi_1.default.string().valid("male", "female", "other").allow(null),
        isHalfDayAllowed: joi_1.default.boolean().default(false),
        isPaidLeave: joi_1.default.boolean().default(true),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string(),
        description: joi_1.default.string(),
        defaultDays: joi_1.default.number().integer().min(0),
        isCarryForward: joi_1.default.boolean(),
        maxCarryForwardDays: joi_1.default.number().integer().min(0),
        isActive: joi_1.default.boolean(),
        applicableGender: joi_1.default.string().valid("male", "female", "other").allow(null),
        isHalfDayAllowed: joi_1.default.boolean(),
        isPaidLeave: joi_1.default.boolean(),
    }),
};
/**
 * Leave balance validation schemas
 */
exports.leaveBalanceValidation = {
    create: joi_1.default.object({
        userId: joi_1.default.string().uuid().required(),
        leaveTypeId: joi_1.default.string().uuid().required(),
        balance: joi_1.default.number().min(0).required(),
        used: joi_1.default.number().min(0).default(0),
        carryForward: joi_1.default.number().min(0).default(0),
        year: joi_1.default.number().integer().min(2000).max(2100),
    }),
    update: joi_1.default.object({
        balance: joi_1.default.number().min(0),
        used: joi_1.default.number().min(0),
        carryForward: joi_1.default.number().min(0),
    }),
    bulkCreate: joi_1.default.object({
        leaveTypeId: joi_1.default.string().uuid().required(),
        year: joi_1.default.number().integer().min(2000).max(2100),
        resetExisting: joi_1.default.boolean().default(false),
    }),
};
/**
 * Leave request validation schemas
 */
exports.leaveRequestValidation = {
    create: joi_1.default.object({
        leaveTypeId: joi_1.default.string().uuid().required(),
        startDate: joi_1.default.date().iso().required(),
        endDate: joi_1.default.date().iso().required(),
        requestType: joi_1.default.string()
            .valid("full_day", "first_half", "second_half")
            .default("full_day"),
        reason: joi_1.default.string().required(),
    }),
    updateStatus: joi_1.default.object({
        status: joi_1.default.string().valid("approved", "rejected", "cancelled").required(),
        comments: joi_1.default.string().allow("", null),
    }),
};
/**
 * Holiday validation schemas
 */
exports.holidayValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().required(),
        date: joi_1.default.date().iso().required(),
        description: joi_1.default.string().allow("", null),
        isActive: joi_1.default.boolean().default(true),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string(),
        date: joi_1.default.date().iso(),
        description: joi_1.default.string().allow("", null),
        isActive: joi_1.default.boolean(),
    }),
    bulkCreate: joi_1.default.object({
        holidays: joi_1.default.array()
            .items(joi_1.default.object({
            name: joi_1.default.string().required(),
            date: joi_1.default.date().iso().required(),
            description: joi_1.default.string().allow("", null),
        }))
            .min(1)
            .required(),
    }),
};
/**
 * Approval workflow validation schemas
 */
exports.approvalWorkflowValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().required(),
        minDays: joi_1.default.number().integer().min(0).required(),
        maxDays: joi_1.default.number().integer().min(0).required(),
        approvalLevels: joi_1.default.array()
            .items(joi_1.default.object({
            level: joi_1.default.number().integer().min(1).required(),
            roles: joi_1.default.array()
                .items(joi_1.default.string().valid("super_admin", "hr", "manager"))
                .min(1)
                .required(),
        }))
            .min(1)
            .required(),
        isActive: joi_1.default.boolean().default(true),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string(),
        minDays: joi_1.default.number().integer().min(0),
        maxDays: joi_1.default.number().integer().min(0),
        approvalLevels: joi_1.default.array()
            .items(joi_1.default.object({
            level: joi_1.default.number().integer().min(1).required(),
            roles: joi_1.default.array()
                .items(joi_1.default.string().valid("super_admin", "hr", "manager"))
                .min(1)
                .required(),
        }))
            .min(1),
        isActive: joi_1.default.boolean(),
    }),
};
//# sourceMappingURL=validationMiddleware.js.map