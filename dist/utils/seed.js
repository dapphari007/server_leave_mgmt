"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const auth_1 = require("./auth");
const logger_1 = __importDefault(require("./logger"));
const seedDatabase = async () => {
    try {
        // Initialize database connection
        await database_1.AppDataSource.initialize();
        // Seed super admin user
        await seedSuperAdmin();
        // Seed leave types
        await seedLeaveTypes();
        // Seed approval workflows
        await seedApprovalWorkflows();
        logger_1.default.info("Database seeded successfully");
        process.exit(0);
    }
    catch (error) {
        logger_1.default.error("Error seeding database:", error);
        process.exit(1);
    }
};
exports.seedDatabase = seedDatabase;
const seedSuperAdmin = async () => {
    const userRepository = database_1.AppDataSource.getRepository(models_1.User);
    // Check if super admin already exists
    const existingSuperAdmin = await userRepository.findOne({
        where: { role: models_1.UserRole.SUPER_ADMIN },
    });
    if (existingSuperAdmin) {
        logger_1.default.info("Super admin already exists, skipping...");
        return;
    }
    // Create super admin
    const superAdmin = new models_1.User();
    superAdmin.firstName = "Super";
    superAdmin.lastName = "Admin";
    superAdmin.email = "admin@example.com";
    superAdmin.password = await (0, auth_1.hashPassword)("Admin@123");
    superAdmin.role = models_1.UserRole.SUPER_ADMIN;
    superAdmin.level = models_1.UserLevel.LEVEL_4;
    superAdmin.gender = models_1.Gender.MALE;
    await userRepository.save(superAdmin);
    logger_1.default.info("Super admin created successfully");
};
const seedLeaveTypes = async () => {
    const leaveTypeRepository = database_1.AppDataSource.getRepository(models_1.LeaveType);
    // Check if leave types already exist
    const existingLeaveTypes = await leaveTypeRepository.find();
    if (existingLeaveTypes.length > 0) {
        logger_1.default.info("Leave types already exist, skipping...");
        return;
    }
    // Create leave types
    const leaveTypes = [
        {
            name: "Annual Leave",
            description: "Regular annual leave for all employees",
            defaultDays: 20,
            isCarryForward: true,
            maxCarryForwardDays: 5,
            isHalfDayAllowed: true,
            isPaidLeave: true,
        },
        {
            name: "Sick Leave",
            description: "Leave for medical reasons",
            defaultDays: 10,
            isCarryForward: false,
            maxCarryForwardDays: 0,
            isHalfDayAllowed: true,
            isPaidLeave: true,
        },
        {
            name: "Work From Home",
            description: "Working remotely from home",
            defaultDays: 15,
            isCarryForward: false,
            maxCarryForwardDays: 0,
            isHalfDayAllowed: true,
            isPaidLeave: true,
        },
        {
            name: "Casual Leave",
            description: "Leave for personal reasons",
            defaultDays: 12,
            isCarryForward: false,
            maxCarryForwardDays: 0,
            isHalfDayAllowed: true,
            isPaidLeave: true,
        },
        {
            name: "Earned Leave",
            description: "Leave earned through overtime or special projects",
            defaultDays: 0,
            isCarryForward: true,
            maxCarryForwardDays: 10,
            isHalfDayAllowed: true,
            isPaidLeave: true,
        },
        {
            name: "Maternity Leave",
            description: "Leave for female employees during pregnancy and after childbirth",
            defaultDays: 90,
            isCarryForward: false,
            maxCarryForwardDays: 0,
            isHalfDayAllowed: false,
            isPaidLeave: true,
            applicableGender: "female",
        },
        {
            name: "Paternity Leave",
            description: "Leave for male employees after the birth of their child",
            defaultDays: 10,
            isCarryForward: false,
            maxCarryForwardDays: 0,
            isHalfDayAllowed: false,
            isPaidLeave: true,
            applicableGender: "male",
        },
        {
            name: "Compensatory Off",
            description: "Leave granted for working on holidays or weekends",
            defaultDays: 0,
            isCarryForward: true,
            maxCarryForwardDays: 5,
            isHalfDayAllowed: true,
            isPaidLeave: true,
        },
        {
            name: "Loss of Pay",
            description: "Unpaid leave when other leave balances are exhausted",
            defaultDays: 0,
            isCarryForward: false,
            maxCarryForwardDays: 0,
            isHalfDayAllowed: true,
            isPaidLeave: false,
        },
    ];
    for (const leaveTypeData of leaveTypes) {
        const leaveType = new models_1.LeaveType();
        Object.assign(leaveType, leaveTypeData);
        await leaveTypeRepository.save(leaveType);
    }
    logger_1.default.info("Leave types created successfully");
};
const seedApprovalWorkflows = async () => {
    const approvalWorkflowRepository = database_1.AppDataSource.getRepository(models_1.ApprovalWorkflow);
    // Check if approval workflows already exist
    const existingWorkflows = await approvalWorkflowRepository.find();
    if (existingWorkflows.length > 0) {
        logger_1.default.info("Approval workflows already exist, skipping...");
        return;
    }
    // Create approval workflows
    const workflows = [
        {
            name: "Short Leave Approval",
            minDays: 1,
            maxDays: 5,
            approvalLevels: [
                {
                    level: 1,
                    roles: [models_1.UserRole.MANAGER],
                },
            ],
        },
        {
            name: "Medium Leave Approval",
            minDays: 6,
            maxDays: 14,
            approvalLevels: [
                {
                    level: 1,
                    roles: [models_1.UserRole.MANAGER],
                },
                {
                    level: 2,
                    roles: [models_1.UserRole.HR],
                },
            ],
        },
        {
            name: "Long Leave Approval",
            minDays: 15,
            maxDays: 90,
            approvalLevels: [
                {
                    level: 1,
                    roles: [models_1.UserRole.MANAGER],
                },
                {
                    level: 2,
                    roles: [models_1.UserRole.HR],
                },
                {
                    level: 3,
                    roles: [models_1.UserRole.SUPER_ADMIN],
                },
            ],
        },
    ];
    for (const workflowData of workflows) {
        const workflow = new models_1.ApprovalWorkflow();
        // Create a copy of the data with stringified approvalLevels
        const processedData = {
            ...workflowData,
            approvalLevels: JSON.stringify(workflowData.approvalLevels),
        };
        Object.assign(workflow, processedData);
        await approvalWorkflowRepository.save(workflow);
    }
    logger_1.default.info("Approval workflows created successfully");
};
// Run the seed function if this file is executed directly
if (require.main === module) {
    (0, exports.seedDatabase)();
}
//# sourceMappingURL=seed.js.map