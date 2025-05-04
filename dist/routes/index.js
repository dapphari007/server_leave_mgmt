"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const leaveTypeRoutes_1 = __importDefault(require("./leaveTypeRoutes"));
const leaveBalanceRoutes_1 = __importDefault(require("./leaveBalanceRoutes"));
const leaveRequestRoutes_1 = __importDefault(require("./leaveRequestRoutes"));
const holidayRoutes_1 = __importDefault(require("./holidayRoutes"));
const approvalWorkflowRoutes_1 = __importDefault(require("./approvalWorkflowRoutes"));
const dashboardRoutes_1 = __importDefault(require("./dashboardRoutes"));
const registerRoutes = (server) => {
    server.route([
        ...authRoutes_1.default,
        ...userRoutes_1.default,
        ...leaveTypeRoutes_1.default,
        ...leaveBalanceRoutes_1.default,
        ...leaveRequestRoutes_1.default,
        ...holidayRoutes_1.default,
        ...approvalWorkflowRoutes_1.default,
        ...dashboardRoutes_1.default,
        // Health check route
        {
            method: 'GET',
            path: '/api/health',
            handler: () => ({ status: 'ok', timestamp: new Date().toISOString() }),
            options: {
                auth: false,
                description: 'Health check endpoint',
                tags: ['api', 'health'],
            },
        },
    ]);
};
exports.registerRoutes = registerRoutes;
//# sourceMappingURL=index.js.map