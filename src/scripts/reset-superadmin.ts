import { AppDataSource } from "../config/database";
import { User, UserRole, UserLevel, Gender } from "../models";
import { hashPassword } from "../utils/auth";
import logger from "../utils/logger";

async function resetSuperAdminPassword() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info("Connected to database");

    // Get the User repository
    const userRepository = AppDataSource.getRepository(User);

    // Find super admin by email
    const superAdmin = await userRepository.findOne({
      where: { email: "admin@example.com" },
    });

    if (!superAdmin) {
      logger.info("Super admin not found. Creating new super admin...");

      // Create a new super admin
      const newSuperAdmin = new User();
      newSuperAdmin.firstName = "Super";
      newSuperAdmin.lastName = "Admin";
      newSuperAdmin.email = "admin@example.com";
      newSuperAdmin.phoneNumber = "+1234567890";
      newSuperAdmin.address = "123 Admin St, City, Country";
      newSuperAdmin.role = UserRole.SUPER_ADMIN;
      newSuperAdmin.level = UserLevel.LEVEL_4;
      newSuperAdmin.gender = Gender.MALE;
      newSuperAdmin.isActive = true;

      // Hash new password
      const newPassword = "Admin@123";
      const hashedPassword = await hashPassword(newPassword);
      newSuperAdmin.password = hashedPassword;

      // Save to database
      const savedSuperAdmin = await userRepository.save(newSuperAdmin);
      logger.info("Super admin created successfully");
      logger.info(`Super admin ID: ${savedSuperAdmin.id}`);
      logger.info(`Super admin email: admin@example.com`);
      logger.info(`Super admin password: ${newPassword}`);
    } else {
      logger.info("Super admin found. Resetting password...");

      // Hash new password
      const newPassword = "Admin@123";
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      superAdmin.password = hashedPassword;
      await userRepository.save(superAdmin);

      logger.info("Super admin password reset successfully");
      logger.info(`Super admin ID: ${superAdmin.id}`);
      logger.info(`Super admin email: admin@example.com`);
      logger.info(`Super admin password: ${newPassword}`);
    }

    // Close connection
    await AppDataSource.destroy();
    logger.info("Connection closed");
  } catch (error) {
    logger.error("Error resetting super admin password:", error);
  }
}

// Run the function
resetSuperAdminPassword();
