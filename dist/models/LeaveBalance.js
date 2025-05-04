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
exports.LeaveBalance = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const LeaveType_1 = require("./LeaveType");
let LeaveBalance = class LeaveBalance {
};
exports.LeaveBalance = LeaveBalance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeaveBalance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.leaveBalances),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_1.User)
], LeaveBalance.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaveBalance.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => LeaveType_1.LeaveType, leaveType => leaveType.leaveBalances),
    (0, typeorm_1.JoinColumn)({ name: 'leaveTypeId' }),
    __metadata("design:type", LeaveType_1.LeaveType)
], LeaveBalance.prototype, "leaveType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaveBalance.prototype, "leaveTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 1, default: 0 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 1, default: 0 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "used", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 1, default: 0 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "carryForward", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LeaveBalance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LeaveBalance.prototype, "updatedAt", void 0);
exports.LeaveBalance = LeaveBalance = __decorate([
    (0, typeorm_1.Entity)('leave_balances')
], LeaveBalance);
//# sourceMappingURL=LeaveBalance.js.map