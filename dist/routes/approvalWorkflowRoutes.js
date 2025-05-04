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
const ApprovalWorkflowController = __importStar(require("../controllers/approvalWorkflowController"));
const approvalWorkflowRoutes = [
    {
        method: 'POST',
        path: '/api/approval-workflows',
        handler: ApprovalWorkflowController.createApprovalWorkflow,
        options: {
            auth: 'super_admin',
            description: 'Create a new approval workflow',
            tags: ['api', 'approval-workflows'],
        },
    },
    {
        method: 'GET',
        path: '/api/approval-workflows',
        handler: ApprovalWorkflowController.getAllApprovalWorkflows,
        options: {
            auth: 'manager_hr',
            description: 'Get all approval workflows',
            tags: ['api', 'approval-workflows'],
        },
    },
    {
        method: 'GET',
        path: '/api/approval-workflows/{id}',
        handler: ApprovalWorkflowController.getApprovalWorkflowById,
        options: {
            auth: 'manager_hr',
            description: 'Get approval workflow by ID',
            tags: ['api', 'approval-workflows'],
        },
    },
    {
        method: 'PUT',
        path: '/api/approval-workflows/{id}',
        handler: ApprovalWorkflowController.updateApprovalWorkflow,
        options: {
            auth: 'super_admin',
            description: 'Update approval workflow',
            tags: ['api', 'approval-workflows'],
        },
    },
    {
        method: 'DELETE',
        path: '/api/approval-workflows/{id}',
        handler: ApprovalWorkflowController.deleteApprovalWorkflow,
        options: {
            auth: 'super_admin',
            description: 'Delete approval workflow',
            tags: ['api', 'approval-workflows'],
        },
    },
];
exports.default = approvalWorkflowRoutes;
//# sourceMappingURL=approvalWorkflowRoutes.js.map