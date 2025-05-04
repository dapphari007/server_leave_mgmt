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
const UserController = __importStar(require("../controllers/userController"));
const userRoutes = [
    {
        method: 'POST',
        path: '/api/users',
        handler: UserController.createUser,
        options: {
            auth: 'super_admin',
            description: 'Create a new user',
            tags: ['api', 'users'],
        },
    },
    {
        method: 'GET',
        path: '/api/users',
        handler: UserController.getAllUsers,
        options: {
            auth: 'manager_hr',
            description: 'Get all users',
            tags: ['api', 'users'],
        },
    },
    {
        method: 'GET',
        path: '/api/users/{id}',
        handler: UserController.getUserById,
        options: {
            auth: 'manager_hr',
            description: 'Get user by ID',
            tags: ['api', 'users'],
        },
    },
    {
        method: 'PUT',
        path: '/api/users/{id}',
        handler: UserController.updateUser,
        options: {
            auth: 'super_admin',
            description: 'Update user',
            tags: ['api', 'users'],
        },
    },
    {
        method: 'DELETE',
        path: '/api/users/{id}',
        handler: UserController.deleteUser,
        options: {
            auth: 'super_admin',
            description: 'Delete user',
            tags: ['api', 'users'],
        },
    },
    {
        method: 'PUT',
        path: '/api/users/{id}/reset-password',
        handler: UserController.resetUserPassword,
        options: {
            auth: 'super_admin',
            description: 'Reset user password',
            tags: ['api', 'users'],
        },
    },
];
exports.default = userRoutes;
//# sourceMappingURL=userRoutes.js.map