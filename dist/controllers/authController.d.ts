import { Request, ResponseToolkit } from "@hapi/hapi";
export declare const register: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const login: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getProfile: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const updateProfile: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const changePassword: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
