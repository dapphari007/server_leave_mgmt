import { AppDataSource } from "../config/database";
import { User, UserRole, UserLevel, Gender } from "../models";
import { hashPassword } from "../utils/auth";
import logger from "../utils/logger";

/**
 * This script creates sample users for admin, manager, and HR roles
 */
export const seedSampleUsers = async (): Promise<void> => {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create sample users
    await createSampleAdmins();
    await createSampleManagers();
    await createSampleHRs();

    logger.info("Sample users created successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error creating sample users:", error);
    process.exit(1);
  }
};

const createSampleAdmins = async (): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);

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
    {
      firstName: "Michael",
      lastName: "Williams",
      email: "michael.williams@example.com",
      password: "Admin@123",
      phoneNumber: "+1-555-345-6789",
      address: "789 Admin Boulevard, Chicago, IL 60601",
      role: UserRole.SUPER_ADMIN,
      level: UserLevel.LEVEL_3,
      gender: Gender.MALE,
    },
    {
      firstName: "Emily",
      lastName: "Brown",
      email: "emily.brown@example.com",
      password: "Admin@123",
      phoneNumber: "+1-555-456-7890",
      address: "101 Admin Road, Austin, TX 78701",
      role: UserRole.SUPER_ADMIN,
      level: UserLevel.LEVEL_3,
      gender: Gender.FEMALE,
    },
    {
      firstName: "David",
      lastName: "Jones",
      email: "david.jones@example.com",
      password: "Admin@123",
      phoneNumber: "+1-555-567-8901",
      address: "202 Admin Lane, Seattle, WA 98101",
      role: UserRole.SUPER_ADMIN,
      level: UserLevel.LEVEL_3,
      gender: Gender.MALE,
    },
  ];

  for (const adminData of admins) {
    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: adminData.email },
    });

    if (existingUser) {
      logger.info(`User ${adminData.email} already exists, skipping...`);
      continue;
    }

    // Create new user
    const admin = new User();
    Object.assign(admin, {
      ...adminData,
      password: await hashPassword(adminData.password),
    });
    await userRepository.save(admin);
    logger.info(`Admin ${adminData.email} created successfully`);
  }
};

const createSampleManagers = async (): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);

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
    {
      firstName: "Patricia",
      lastName: "Taylor",
      email: "patricia.taylor@example.com",
      password: "Manager@123",
      phoneNumber: "+1-555-901-2345",
      address: "606 Manager Road, Miami, FL 33131",
      role: UserRole.MANAGER,
      level: UserLevel.LEVEL_2,
      gender: Gender.FEMALE,
    },
    {
      firstName: "Thomas",
      lastName: "Anderson",
      email: "thomas.anderson@example.com",
      password: "Manager@123",
      phoneNumber: "+1-555-012-3456",
      address: "707 Manager Lane, Portland, OR 97201",
      role: UserRole.MANAGER,
      level: UserLevel.LEVEL_2,
      gender: Gender.MALE,
    },
    {
      firstName: "Elizabeth",
      lastName: "Martinez",
      email: "elizabeth.martinez@example.com",
      password: "Manager@123",
      phoneNumber: "+1-555-123-4567",
      address: "808 Manager Court, Phoenix, AZ 85004",
      role: UserRole.MANAGER,
      level: UserLevel.LEVEL_2,
      gender: Gender.FEMALE,
    },
  ];

  for (const managerData of managers) {
    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: managerData.email },
    });

    if (existingUser) {
      logger.info(`User ${managerData.email} already exists, skipping...`);
      continue;
    }

    // Create new user
    const manager = new User();
    Object.assign(manager, {
      ...managerData,
      password: await hashPassword(managerData.password),
    });
    await userRepository.save(manager);
    logger.info(`Manager ${managerData.email} created successfully`);
  }
};

const createSampleHRs = async (): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);

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
    {
      firstName: "Daniel",
      lastName: "Lee",
      email: "daniel.lee@example.com",
      password: "HR@123",
      phoneNumber: "+1-555-567-8901",
      address: "1212 HR Road, Minneapolis, MN 55401",
      role: UserRole.HR,
      level: UserLevel.LEVEL_2,
      gender: Gender.MALE,
    },
    {
      firstName: "Nancy",
      lastName: "Walker",
      email: "nancy.walker@example.com",
      password: "HR@123",
      phoneNumber: "+1-555-678-9012",
      address: "1313 HR Lane, Detroit, MI 48226",
      role: UserRole.HR,
      level: UserLevel.LEVEL_1,
      gender: Gender.FEMALE,
    },
  ];

  for (const hrData of hrs) {
    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: hrData.email },
    });

    if (existingUser) {
      logger.info(`User ${hrData.email} already exists, skipping...`);
      continue;
    }

    // Create new user
    const hr = new User();
    Object.assign(hr, {
      ...hrData,
      password: await hashPassword(hrData.password),
    });
    await userRepository.save(hr);
    logger.info(`HR ${hrData.email} created successfully`);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedSampleUsers();
}
