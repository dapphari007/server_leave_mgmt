import { Request, ResponseToolkit } from "@hapi/hapi";
export declare const createLeaveRequest: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getAllLeaveRequests: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getLeaveRequestById: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getUserLeaveRequests: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getManagerLeaveRequests: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const updateLeaveRequestStatus: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const cancelLeaveRequest: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
