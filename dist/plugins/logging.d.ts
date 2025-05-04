import { Server } from "@hapi/hapi";
export declare const loggingPlugin: {
    name: string;
    version: string;
    register: (server: Server) => Promise<void>;
};
