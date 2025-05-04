import { Server } from "@hapi/hapi";
export declare const authPlugin: {
    name: string;
    version: string;
    register: (server: Server) => Promise<void>;
};
