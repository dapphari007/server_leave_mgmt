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
const LeaveTypeController = __importStar(require("../controllers/leaveTypeController"));
const leaveTypeRoutes = [
    {
        method: 'POST',
        path: '/api/leave-types',
        handler: LeaveTypeController.createLeaveType,
        options: {
            auth: 'super_admin',
            description: 'Create a new leave type',
            tags: ['api', 'leave-types'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-types',
        handler: LeaveTypeController.getAllLeaveTypes,
        options: {
            auth: 'all_roles',
            description: 'Get all leave types',
            tags: ['api', 'leave-types'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-types/{id}',
        handler: LeaveTypeController.getLeaveTypeById,
        options: {
            auth: 'all_roles',
            description: 'Get leave type by ID',
            tags: ['api', 'leave-types'],
        },
    },
    {
        method: 'PUT',
        path: '/api/leave-types/{id}',
        handler: LeaveTypeController.updateLeaveType,
        options: {
            auth: 'super_admin',
            description: 'Update leave type',
            tags: ['api', 'leave-types'],
        },
    },
    {
        method: 'DELETE',
        path: '/api/leave-types/{id}',
        handler: LeaveTypeController.deleteLeaveType,
        options: {
            auth: 'super_admin',
            description: 'Delete leave type',
            tags: ['api', 'leave-types'],
        },
    },
];
exports.default = leaveTypeRoutes;
//# sourceMappingURL=leaveTypeRoutes.js.map