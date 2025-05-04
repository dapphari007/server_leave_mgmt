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
exports.User = exports.Gender = exports.UserLevel = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const LeaveRequest_1 = require("./LeaveRequest");
const LeaveBalance_1 = require("./LeaveBalance");
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["MANAGER"] = "manager";
    UserRole["HR"] = "hr";
    UserRole["EMPLOYEE"] = "employee";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserLevel;
(function (UserLevel) {
    UserLevel[UserLevel["LEVEL_1"] = 1] = "LEVEL_1";
    UserLevel[UserLevel["LEVEL_2"] = 2] = "LEVEL_2";
    UserLevel[UserLevel["LEVEL_3"] = 3] = "LEVEL_3";
    UserLevel[UserLevel["LEVEL_4"] = 4] = "LEVEL_4";
})(UserLevel || (exports.UserLevel = UserLevel = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: UserRole,
        enumName: "user_role_enum",
        default: UserRole.EMPLOYEE,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: UserLevel,
        enumName: "user_level_enum",
        default: UserLevel.LEVEL_1,
    }),
    __metadata("design:type", Number)
], User.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Gender,
        enumName: "gender_enum",
        nullable: true,
    }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => LeaveRequest_1.LeaveRequest, (leaveRequest) => leaveRequest.user),
    __metadata("design:type", Array)
], User.prototype, "leaveRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => LeaveRequest_1.LeaveRequest, (leaveRequest) => leaveRequest.approver),
    __metadata("design:type", Array)
], User.prototype, "approvedLeaveRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => LeaveBalance_1.LeaveBalance, (leaveBalance) => leaveBalance.user),
    __metadata("design:type", Array)
], User.prototype, "leaveBalances", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)("users")
], User);
//# sourceMappingURL=User.js.map