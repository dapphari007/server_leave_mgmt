import { Server } from '@hapi/hapi';
import * as validationSchemas from './validationMiddleware';
/**
 * Register all middlewares
 */
export declare const registerMiddlewares: (server: Server) => void;
export { validationSchemas };
