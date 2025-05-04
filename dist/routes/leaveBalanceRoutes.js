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
const LeaveBalanceController = __importStar(require("../controllers/leaveBalanceController"));
const leaveBalanceRoutes = [
    {
        method: 'POST',
        path: '/api/leave-balances',
        handler: LeaveBalanceController.createLeaveBalance,
        options: {
            auth: 'super_admin',
            description: 'Create a new leave balance',
            tags: ['api', 'leave-balances'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-balances',
        handler: LeaveBalanceController.getAllLeaveBalances,
        options: {
            auth: 'manager_hr',
            description: 'Get all leave balances',
            tags: ['api', 'leave-balances'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-balances/{id}',
        handler: LeaveBalanceController.getLeaveBalanceById,
        options: {
            auth: 'manager_hr',
            description: 'Get leave balance by ID',
            tags: ['api', 'leave-balances'],
        },
    },
    {
        method: 'GET',
        path: '/api/leave-balances/my-balances',
        handler: LeaveBalanceController.getUserLeaveBalances,
        options: {
            auth: 'all_roles',
            description: 'Get current user leave balances',
            tags: ['api', 'leave-balances'],
        },
    },
    {
        method: 'PUT',
        path: '/api/leave-balances/{id}',
        handler: LeaveBalanceController.updateLeaveBalance,
        options: {
            auth: 'super_admin',
            description: 'Update leave balance',
            tags: ['api', 'leave-balances'],
        },
    },
    {
        method: 'DELETE',
        path: '/api/leave-balances/{id}',
        handler: LeaveBalanceController.deleteLeaveBalance,
        options: {
            auth: 'super_admin',
            description: 'Delete leave balance',
            tags: ['api', 'leave-balances'],
        },
    },
    {
        method: 'POST',
        path: '/api/leave-balances/bulk-create',
        handler: LeaveBalanceController.bulkCreateLeaveBalances,
        options: {
            auth: 'super_admin',
            description: 'Bulk create leave balances for all users',
            tags: ['api', 'leave-balances'],
        },
    },
];
exports.default = leaveBalanceRoutes;
//# sourceMappingURL=leaveBalanceRoutes.js.map