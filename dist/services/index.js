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
exports.dashboardService = exports.approvalWorkflowService = exports.holidayService = exports.leaveRequestService = exports.leaveBalanceService = exports.leaveTypeService = exports.userService = exports.authService = void 0;
const authService = __importStar(require("./authService"));
exports.authService = authService;
const userService = __importStar(require("./userService"));
exports.userService = userService;
const leaveTypeService = __importStar(require("./leaveTypeService"));
exports.leaveTypeService = leaveTypeService;
const leaveBalanceService = __importStar(require("./leaveBalanceService"));
exports.leaveBalanceService = leaveBalanceService;
const leaveRequestService = __importStar(require("./leaveRequestService"));
exports.leaveRequestService = leaveRequestService;
const holidayService = __importStar(require("./holidayService"));
exports.holidayService = holidayService;
const approvalWorkflowService = __importStar(require("./approvalWorkflowService"));
exports.approvalWorkflowService = approvalWorkflowService;
const dashboardService = __importStar(require("./dashboardService"));
exports.dashboardService = dashboardService;
//# sourceMappingURL=index.js.map