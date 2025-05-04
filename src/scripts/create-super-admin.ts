import { AppDataSource } from "../config/database";
import { User, UserRole, UserLevel, Gender } from "../models";
import { hashPassword } from "../utils/auth";
import logger from "../utils/logger";

async function createSuperAdmin() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info("Connected to database");

    // Get the User repository
    const userRepository = AppDataSource.getRepository(User);

    // Check if super admin already exists
    const existingSuperAdmin = await userRepository.findOne({
      where: { email: "admin@example.com" },
    });

    if (existingSuperAdmin) {
      logger.info("Super admin already exists");
      logger.info(`Super admin ID: ${existingSuperAdmin.id}`);
      logger.info(`Super admin email: admin@example.com`);
      logger.info(`Super admin password: Admin@123`);
      await AppDataSource.destroy();
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword("Admin@123");

    // Create super admin user
    const superAdmin = new User();
    superAdmin.firstName = "Super";
    superAdmin.lastName = "Admin";
    superAdmin.email = "admin@example.com";
    superAdmin.password = hashedPassword;
    superAdmin.phoneNumber = "+1234567890";
    superAdmin.address = "123 Admin St, City, Country";
    superAdmin.role = UserRole.SUPER_ADMIN;
    superAdmin.level = UserLevel.LEVEL_4;
    superAdmin.gender = Gender.MALE;
    superAdmin.isActive = true;

    // Save super admin to database
    const savedSuperAdmin = await userRepository.save(superAdmin);
    logger.info("Super admin created successfully");
    logger.info(`Super admin ID: ${savedSuperAdmin.id}`);
    logger.info(`Super admin email: admin@example.com`);
    logger.info(`Super admin password: Admin@123`);

    // Close connection
    await AppDataSource.destroy();
    logger.info("Connection closed");
  } catch (error) {
    logger.error("Error creating super admin:", error);
  }
}

// Run the function
createSuperAdmin();
