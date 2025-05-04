"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const LeaveRequestController = __importStar(require("../controllers/leaveRequestController"));
const leaveRequestRoutes = [
    {
        method: 'POST',
        path: '/api/leave-requests',
        handler: LeaveRequestController.createLeaveRequest,
        options: {
            auth: 'all_roles',
            description: 'Create a new leave request',
            tags: ['api', 'leave-requests'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-requests',
        handler: LeaveRequestController.getAllLeaveRequests,
        options: {
            auth: 'manager_hr',
            description: 'Get all leave requests',
            tags: ['api', 'leave-requests'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-requests/{id}',
        handler: LeaveRequestController.getLeaveRequestById,
        options: {
            auth: 'all_roles',
            description: 'Get leave request by ID',
            tags: ['api', 'leave-requests'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-requests/my-requests',
        handler: LeaveRequestController.getUserLeaveRequests,
        options: {
            auth: 'all_roles',
            description: 'Get current user leave requests',
            tags: ['api', 'leave-requests'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-requests/team-requests',
        handler: LeaveRequestController.getManagerLeaveRequests,
        options: {
            auth: 'manager',
            description: 'Get leave requests for team members',
            tags: ['api', 'leave-requests'],
        },
    },
    {
        method: 'PUT',
        path: '/api/leave-requests/{id}/status',
        handler: LeaveRequestController.updateLeaveRequestStatus,
        options: {
            auth: 'manager_hr',
            description: 'Update leave request status',
            tags: ['api', 'leave-requests'],
        },
    },
    {
        method: 'PUT',
        path: '/api/leave-requests/{id}/cancel',
        handler: LeaveRequestController.cancelLeaveRequest,
        options: {
            auth: 'all_roles',
            description: 'Cancel leave request',
            tags: ['api', 'leave-requests'],
        },
    },
];
exports.default = leaveRequestRoutes;
//# sourceMappingURL=leaveRequestRoutes.js.map