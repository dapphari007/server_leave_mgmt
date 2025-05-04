import { Request, ResponseToolkit } from '@hapi/hapi';
export declare const createHoliday: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getAllHolidays: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const getHolidayById: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const updateHoliday: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const deleteHoliday: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
export declare const bulkCreateHolidays: (request: Request, h: ResponseToolkit) => Promise<import("@hapi/hapi").ResponseObject>;
