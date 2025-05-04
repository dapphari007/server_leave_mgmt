import { AppDataSource } from "../config/database";
import { User, UserRole, UserLevel, Gender } from "../models";
import { hashPassword } from "../utils/auth";
import logger from "../utils/logger";

async function createManager() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info("Connected to database");

    // Get the User repository
    const userRepository = AppDataSource.getRepository(User);

    // Check if manager already exists
    const existingManager = await userRepository.findOne({
      where: { email: "manager@example.com" },
    });

    if (existingManager) {
      logger.info("Manager already exists");
      logger.info(`Manager ID: ${existingManager.id}`);
      await AppDataSource.destroy();
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword("Manager@123");

    // Create manager user
    const manager = new User();
    manager.firstName = "Test";
    manager.lastName = "Manager";
    manager.email = "manager@example.com";
    manager.password = hashedPassword;
    manager.phoneNumber = "+1234567890";
    manager.address = "123 Manager St, City, Country";
    manager.role = UserRole.MANAGER;
    manager.level = UserLevel.LEVEL_2;
    manager.gender = Gender.MALE;
    manager.isActive = true;

    // Save manager to database
    const savedManager = await userRepository.save(manager);
    logger.info("Manager created successfully");
    logger.info(`Manager ID: ${savedManager.id}`);

    // Close connection
    await AppDataSource.destroy();
    logger.info("Connection closed");
  } catch (error) {
    logger.error("Error creating manager:", error);
  }
}

// Run the function
createManager();
