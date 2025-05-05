import { AppDataSource } from "../config/database";
import { User, UserRole, UserLevel, Gender } from "../models";
import { hashPassword } from "./auth";
import logger from "./logger";

/**
 * Ensures that a superadmin user exists in the database
 * If the superadmin doesn't exist, it creates one
 * If the superadmin exists, it leaves it unchanged to preserve data
 */
export const ensureSuperAdmin = async (): Promise<void> => {
  try {
    // Check if database is initialized
    if (!AppDataSource.isInitialized) {
      logger.info("Initializing database connection for superadmin check");
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);

    // Default superadmin credentials
    const superAdminEmail = "admin@example.com";
    const superAdminPassword = "Admin@123";

    // Find super admin by email
    const superAdmin = await userRepository.findOne({
      where: { email: superAdminEmail },
    });

    if (!superAdmin) {
      logger.info("Super admin not found. Creating new super admin...");

      // Create a new super admin
      const newSuperAdmin = new User();
      newSuperAdmin.firstName = "Super";
      newSuperAdmin.lastName = "Admin";
      newSuperAdmin.email = superAdminEmail;
      newSuperAdmin.phoneNumber = "+1234567890";
      newSuperAdmin.address = "123 Admin St, City, Country";
      newSuperAdmin.role = UserRole.SUPER_ADMIN;
      newSuperAdmin.level = UserLevel.LEVEL_4;
      newSuperAdmin.gender = Gender.MALE;
      newSuperAdmin.isActive = true;

      // Hash password
      const hashedPassword = await hashPassword(superAdminPassword);
      newSuperAdmin.password = hashedPassword;

      // Save to database
      const savedSuperAdmin = await userRepository.save(newSuperAdmin);
      logger.info("Super admin created successfully");
      logger.info(`Super admin ID: ${savedSuperAdmin.id}`);
      logger.info(`Super admin email: ${superAdminEmail}`);
      logger.info(`Super admin password: ${superAdminPassword}`);
    } else {
      logger.info("Super admin found. Preserving existing data...");
      logger.info(`Super admin ID: ${superAdmin.id}`);
      logger.info(`Super admin email: ${superAdminEmail}`);
    }
  } catch (error) {
    logger.error("Error ensuring super admin exists:", error);
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  ensureSuperAdmin()
    .then(() => {
      logger.info("Super admin check completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Error in ensure-superadmin script:", error);
      process.exit(1);
    });
}
