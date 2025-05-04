import { Request, ResponseToolkit } from '@hapi/hapi';
/**
 * Authentication strategy for all roles
 */
export declare const allRolesAuth: {
    name: string;
    scheme: string;
    options: {
        key: string;
        validate: (decoded: any, request: Request, h: ResponseToolkit) => Promise<{
            isValid: boolean;
            credentials: any;
        } | {
            isValid: boolean;
            credentials?: undefined;
        }>;
        verifyOptions: {
            algorithms: string[];
        };
    };
};
/**
 * Authentication strategy for super admin only
 */
export declare const superAdminAuth: {
    name: string;
    scheme: string;
    options: {
        key: string;
        validate: (decoded: any, request: Request, h: ResponseToolkit) => Promise<{
            isValid: boolean;
            credentials?: undefined;
        } | {
            isValid: boolean;
            credentials: any;
        }>;
        verifyOptions: {
            algorithms: string[];
        };
    };
};
/**
 * Authentication strategy for managers and HR
 */
export declare const managerHrAuth: {
    name: string;
    scheme: string;
    options: {
        key: string;
        validate: (decoded: any, request: Request, h: ResponseToolkit) => Promise<{
            isValid: boolean;
            credentials?: undefined;
        } | {
            isValid: boolean;
            credentials: any;
        }>;
        verifyOptions: {
            algorithms: string[];
        };
    };
};
/**
 * Authentication strategy for managers only
 */
export declare const managerAuth: {
    name: string;
    scheme: string;
    options: {
        key: string;
        validate: (decoded: any, request: Request, h: ResponseToolkit) => Promise<{
            isValid: boolean;
            credentials?: undefined;
        } | {
            isValid: boolean;
            credentials: any;
        }>;
        verifyOptions: {
            algorithms: string[];
        };
    };
};
/**
 * Authentication strategy for HR only
 */
export declare const hrAuth: {
    name: string;
    scheme: string;
    options: {
        key: string;
        validate: (decoded: any, request: Request, h: ResponseToolkit) => Promise<{
            isValid: boolean;
            credentials?: undefined;
        } | {
            isValid: boolean;
            credentials: any;
        }>;
        verifyOptions: {
            algorithms: string[];
        };
    };
};
