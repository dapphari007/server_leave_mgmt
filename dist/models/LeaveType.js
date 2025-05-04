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
exports.LeaveType = void 0;
const typeorm_1 = require("typeorm");
const LeaveRequest_1 = require("./LeaveRequest");
const LeaveBalance_1 = require("./LeaveBalance");
let LeaveType = class LeaveType {
};
exports.LeaveType = LeaveType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LeaveType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], LeaveType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaveType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LeaveType.prototype, "defaultDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LeaveType.prototype, "isCarryForward", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LeaveType.prototype, "maxCarryForwardDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LeaveType.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: "varchar",
    }),
    __metadata("design:type", String)
], LeaveType.prototype, "applicableGender", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LeaveType.prototype, "isHalfDayAllowed", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LeaveType.prototype, "isPaidLeave", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LeaveType.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LeaveType.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => LeaveRequest_1.LeaveRequest, (leaveRequest) => leaveRequest.leaveType),
    __metadata("design:type", Array)
], LeaveType.prototype, "leaveRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => LeaveBalance_1.LeaveBalance, (leaveBalance) => leaveBalance.leaveType),
    __metadata("design:type", Array)
], LeaveType.prototype, "leaveBalances", void 0);
exports.LeaveType = LeaveType = __decorate([
    (0, typeorm_1.Entity)("leave_types")
], LeaveType);
//# sourceMappingURL=LeaveType.js.map