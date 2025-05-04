"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequest = exports.LeaveRequestType = exports.LeaveRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const LeaveType_1 = require("./LeaveType");
var LeaveRequestStatus;
(function (LeaveRequestStatus) {
    LeaveRequestStatus["PENDING"] = "pending";
    LeaveRequestStatus["APPROVED"] = "approved";
    LeaveRequestStatus["REJECTED"] = "rejected";
    LeaveRequestStatus["CANCELLED"] = "cancelled";
})(LeaveRequestStatus || (exports.LeaveRequestStatus = LeaveRequestStatus = {}));
var LeaveRequestType;
(function (LeaveRequestType) {
    LeaveRequestType["FULL_DAY"] = "full_day";
    LeaveRequestType["HALF_DAY_MORNING"] = "half_day_morning";
    LeaveRequestType["HALF_DAY_AFTERNOON"] = "half_day_afternoon";
})(LeaveRequestType || (exports.LeaveRequestType = LeaveRequestType = {}));
let LeaveRequest = class LeaveRequest {
};
exports.LeaveRequest = LeaveRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LeaveRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.leaveRequests),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", User_1.User)
], LeaveRequest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaveRequest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => LeaveType_1.LeaveType, (leaveType) => leaveType.leaveRequests),
    (0, typeorm_1.JoinColumn)({ name: "leaveTypeId" }),
    __metadata("design:type", LeaveType_1.LeaveType)
], LeaveRequest.prototype, "leaveType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaveRequest.prototype, "leaveTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: LeaveRequestType,
        enumName: "leave_request_type_enum",
        default: LeaveRequestType.FULL_DAY,
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "requestType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 5, scale: 1 }),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "numberOfDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: LeaveRequestStatus,
        enumName: "leave_request_status_enum",
        default: LeaveRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.approvedLeaveRequests, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: "approverId" }),
    __metadata("design:type", User_1.User)
], LeaveRequest.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "approverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "approverComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "updatedAt", void 0);
exports.LeaveRequest = LeaveRequest = __decorate([
    (0, typeorm_1.Entity)("leave_requests")
], LeaveRequest);
//# sourceMappingURL=LeaveRequest.js.map