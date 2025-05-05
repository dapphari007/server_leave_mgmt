import { AppDataSource } from "../config/database";
import {
  User,
  UserRole,
  UserLevel,
  Gender,
  LeaveType,
  ApprovalWorkflow,
} from "../models";
import { hashPassword } from "./auth";
import logger from "./logger";

/**
 * Ensures that initial data exists in the database
 * Only creates data if it doesn't already exist
 * This preserves existing data including HR, managers, and leave types
 */

export const ensureInitialData = async (): Promise<void> => {
  try {
    // Check if database is initialized
    if (!AppDataSource.isInitialized) {
      logger.info("Initializing database connection for initial data check");
      await AppDataSource.initialize();
    }

    // Ensure leave types exist
    await ensureLeaveTypes();

    // Ensure approval workflows exist
    await ensureApprovalWorkflows();

    // Ensure sample users exist
    await ensureSampleUsers();

    logger.info("Initial data check completed successfully");
  } catch (error) {
    logger.error("Error ensuring initial data exists:", error);
  }
};

/**
 * Ensures that leave types exist in the database
 * Only creates leave types if they don't already exist
 */
const ensureLeaveTypes = async (): Promise<void> => {
  const leaveTypeRepository = AppDataSource.getRepository(LeaveType);

  // Check if leave types already exist
  const existingLeaveTypes = await leaveTypeRepository.find();

  if (existingLeaveTypes.length > 0) {
    logger.info(
      `${existingLeaveTypes.length} leave types already exist, preserving data...`
    );
    return;
  }

  logger.info("No leave types found. Creating default leave types...");

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
      description:
        "Leave for female employees during pregnancy and after childbirth",
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
    const leaveType = new LeaveType();
    Object.assign(leaveType, leaveTypeData);
    await leaveTypeRepository.save(leaveType);
    logger.info(`Created leave type: ${leaveTypeData.name}`);
  }

  logger.info("Default leave types created successfully");
};

/**
 * Ensures that approval workflows exist in the database
 * Only creates approval workflows if they don't already exist
 */
const ensureApprovalWorkflows = async (): Promise<void> => {
  const approvalWorkflowRepository =
    AppDataSource.getRepository(ApprovalWorkflow);

  // Check if approval workflows already exist
  const existingWorkflows = await approvalWorkflowRepository.find();

  if (existingWorkflows.length > 0) {
    logger.info(
      `${existingWorkflows.length} approval workflows already exist, preserving data...`
    );
    return;
  }

  logger.info("No approval workflows found. Creating default workflows...");

  // Create approval workflows
  const workflows = [
    {
      name: "Short Leave Approval",
      minDays: 1,
      maxDays: 5,
      approvalLevels: [
        {
          level: 1,
          roles: [UserRole.MANAGER],
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
          roles: [UserRole.MANAGER],
        },
        {
          level: 2,
          roles: [UserRole.HR],
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
          roles: [UserRole.MANAGER],
        },
        {
          level: 2,
          roles: [UserRole.HR],
        },
        {
          level: 3,
          roles: [UserRole.SUPER_ADMIN],
        },
      ],
    },
  ];

  for (const workflowData of workflows) {
    const workflow = new ApprovalWorkflow();
    // Use the approvalLevels directly as a JSON object, not as a string
    Object.assign(workflow, workflowData);
    await approvalWorkflowRepository.save(workflow);
    logger.info(`Created approval workflow: ${workflowData.name}`);
  }

  logger.info("Default approval workflows created successfully");
};

/**
 * Ensures that sample users (admins, managers, HR) exist in the database
 * Only creates users if they don't already exist
 */
const ensureSampleUsers = async (): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);

  // Check if we already have managers and HR users
  const managerCount = await userRepository.count({
    where: { role: UserRole.MANAGER },
  });

  const hrCount = await userRepository.count({
    where: { role: UserRole.HR },
  });

  if (managerCount >= 3 && hrCount >= 3) {
    logger.info(
      `${managerCount} managers and ${hrCount} HR users already exist, preserving data...`
    );
    return;
  }

  logger.info("Creating sample users (admins, managers, HR)...");

  // Sample admins
  const admins = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      password: "Admin@123",
      phoneNumber: "+1-555-123-4567",
      address: "123 Admin Street, New York, NY 10001",
      role: UserRole.SUPER_ADMIN,
      level: UserLevel.LEVEL_4,
      gender: Gender.MALE,
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      password: "Admin@123",
      phoneNumber: "+1-555-234-5678",
      address: "456 Admin Avenue, San Francisco, CA 94105",
      role: UserRole.SUPER_ADMIN,
      level: UserLevel.LEVEL_4,
      gender: Gender.FEMALE,
    },
  ];

  // Sample managers
  const managers = [
    {
      firstName: "Robert",
      lastName: "Miller",
      email: "robert.miller@example.com",
      password: "Manager@123",
      phoneNumber: "+1-555-678-9012",
      address: "303 Manager Street, Boston, MA 02108",
      role: UserRole.MANAGER,
      level: UserLevel.LEVEL_3,
      gender: Gender.MALE,
    },
    {
      firstName: "Jennifer",
      lastName: "Davis",
      email: "jennifer.davis@example.com",
      password: "Manager@123",
      phoneNumber: "+1-555-789-0123",
      address: "404 Manager Avenue, Denver, CO 80202",
      role: UserRole.MANAGER,
      level: UserLevel.LEVEL_3,
      gender: Gender.FEMALE,
    },
    {
      firstName: "James",
      lastName: "Wilson",
      email: "james.wilson@example.com",
      password: "Manager@123",
      phoneNumber: "+1-555-890-1234",
      address: "505 Manager Boulevard, Atlanta, GA 30303",
      role: UserRole.MANAGER,
      level: UserLevel.LEVEL_2,
      gender: Gender.MALE,
    },
  ];

  // Sample HR personnel
  const hrs = [
    {
      firstName: "Susan",
      lastName: "Clark",
      email: "susan.clark@example.com",
      password: "HR@123",
      phoneNumber: "+1-555-234-5678",
      address: "909 HR Street, Philadelphia, PA 19103",
      role: UserRole.HR,
      level: UserLevel.LEVEL_3,
      gender: Gender.FEMALE,
    },
    {
      firstName: "Richard",
      lastName: "Rodriguez",
      email: "richard.rodriguez@example.com",
      password: "HR@123",
      phoneNumber: "+1-555-345-6789",
      address: "1010 HR Avenue, San Diego, CA 92101",
      role: UserRole.HR,
      level: UserLevel.LEVEL_2,
      gender: Gender.MALE,
    },
    {
      firstName: "Karen",
      lastName: "Lewis",
      email: "karen.lewis@example.com",
      password: "HR@123",
      phoneNumber: "+1-555-456-7890",
      address: "1111 HR Boulevard, Dallas, TX 75201",
      role: UserRole.HR,
      level: UserLevel.LEVEL_2,
      gender: Gender.FEMALE,
    },
  ];

  // Helper function to create users
  const createUsers = async (users: any[], roleType: string) => {
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        logger.info(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user with hashed password
      const user = new User();
      const { password, ...rest } = userData;
      Object.assign(user, {
        ...rest,
        password: await hashPassword(password),
      });

      await userRepository.save(user);
      logger.info(`Created ${roleType} user: ${userData.email}`);
    }
  };

  // Create all sample users
  await createUsers(admins, "admin");
  await createUsers(managers, "manager");
  await createUsers(hrs, "HR");

  logger.info("Sample users created successfully");
};

// Run the function if this file is executed directly
if (require.main === module) {
  ensureInitialData()
    .then(() => {
      logger.info("Initial data check completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Error in ensure-initial-data script:", error);
      process.exit(1);
    });
}
