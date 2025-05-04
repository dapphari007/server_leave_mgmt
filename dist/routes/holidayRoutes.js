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
const HolidayController = __importStar(require("../controllers/holidayController"));
const holidayRoutes = [
    {
        method: 'POST',
        path: '/api/holidays',
        handler: HolidayController.createHoliday,
        options: {
            auth: 'super_admin',
            description: 'Create a new holiday',
            tags: ['api', 'holidays'],
        },
    },
    {
        method: 'GET',
        path: '/api/holidays',
        handler: HolidayController.getAllHolidays,
        options: {
            auth: 'all_roles',
            description: 'Get all holidays',
            tags: ['api', 'holidays'],
        },
    },
    {
        method: 'GET',
        path: '/api/holidays/{id}',
        handler: HolidayController.getHolidayById,
        options: {
            auth: 'all_roles',
            description: 'Get holiday by ID',
            tags: ['api', 'holidays'],
        },
    },
    {
        method: 'PUT',
        path: '/api/holidays/{id}',
        handler: HolidayController.updateHoliday,
        options: {
            auth: 'super_admin',
            description: 'Update holiday',
            tags: ['api', 'holidays'],
        },
    },
    {
        method: 'DELETE',
        path: '/api/holidays/{id}',
        handler: HolidayController.deleteHoliday,
        options: {
            auth: 'super_admin',
            description: 'Delete holiday',
            tags: ['api', 'holidays'],
        },
    },
    {
        method: 'POST',
        path: '/api/holidays/bulk-create',
        handler: HolidayController.bulkCreateHolidays,
        options: {
            auth: 'super_admin',
            description: 'Bulk create holidays',
            tags: ['api', 'holidays'],
        },
    },
];
exports.default = holidayRoutes;
//# sourceMappingURL=holidayRoutes.js.map