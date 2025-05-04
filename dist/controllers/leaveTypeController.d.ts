import { Request, ResponseToolkit } from "@hapi/hapi";
export declare const createLeaveType: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getAllLeaveTypes: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getLeaveTypeById: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const updateLeaveType: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const deleteLeaveType: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
