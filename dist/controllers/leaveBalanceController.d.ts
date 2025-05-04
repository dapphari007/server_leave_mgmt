import { Request, ResponseToolkit } from "@hapi/hapi";
export declare const createLeaveBalance: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getAllLeaveBalances: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getLeaveBalanceById: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getUserLeaveBalances: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const updateLeaveBalance: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const deleteLeaveBalance: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const bulkCreateLeaveBalances: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
