import Joi from "joi";
/**
 * User validation schemas
 */
export declare const userValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
    changePassword: Joi.ObjectSchema<any>;
    resetPassword: Joi.ObjectSchema<any>;
};
/**
 * Authentication validation schemas
 */
export declare const authValidation: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    updateProfile: Joi.ObjectSchema<any>;
};
/**
 * Leave type validation schemas
 */
export declare const leaveTypeValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
/**
 * Leave balance validation schemas
 */
export declare const leaveBalanceValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
    bulkCreate: Joi.ObjectSchema<any>;
};
/**
 * Leave request validation schemas
 */
export declare const leaveRequestValidation: {
    create: Joi.ObjectSchema<any>;
    updateStatus: Joi.ObjectSchema<any>;
};
/**
 * Holiday validation schemas
 */
export declare const holidayValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
    bulkCreate: Joi.ObjectSchema<any>;
};
/**
 * Approval workflow validation schemas
 */
export declare const approvalWorkflowValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
