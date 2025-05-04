import { Request, ResponseToolkit } from "@hapi/hapi";
export declare const createApprovalWorkflow: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getAllApprovalWorkflows: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getApprovalWorkflowById: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const updateApprovalWorkflow: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const deleteApprovalWorkflow: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
