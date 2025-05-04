import { Request, ResponseToolkit } from '@hapi/hapi';
/**
 * Global error handler middleware
 */
export declare const errorHandler: (request: Request, h: ResponseToolkit, err?: Error) => Promise<symbol | import("@hapi/hapi").ResponseObject>;
/**
 * Not found handler middleware
 */
export declare const notFoundHandler: (request: Request, h: ResponseToolkit) => import("@hapi/hapi").ResponseObject;
/**
 * Validation error handler middleware
 */
export declare const validationErrorHandler: (request: Request, h: ResponseToolkit, err: Error) => symbol | import("@hapi/hapi").ResponseObject;
