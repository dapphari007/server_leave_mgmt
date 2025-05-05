const { AppDataSource } = require("./src/config/database");
const { User } = require("./src/models");
const bcrypt = require("bcrypt");

async function resetSuperAdminPassword() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Connected to database");

    // Get the User repository
    const userRepository = AppDataSource.getRepository(User);

    // Find super admin by email
    const superAdmin = await userRepository.findOne({
      where: { email: "admin@example.com" },
    });

    if (!superAdmin) {
      console.log("Super admin not found. Creating new super admin...");

      // Create a new super admin
      const newSuperAdmin = new User();
      newSuperAdmin.firstName = "Super";
      newSuperAdmin.lastName = "Admin";
      newSuperAdmin.email = "admin@example.com";
      newSuperAdmin.phoneNumber = "+1234567890";
      newSuperAdmin.address = "123 Admin St, City, Country";
      newSuperAdmin.role = "super_admin";
      newSuperAdmin.level = 4;
      newSuperAdmin.gender = "male";
      newSuperAdmin.isActive = true;

      // Hash new password
      const newPassword = "Admin@123456";
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      newSuperAdmin.password = hashedPassword;

      // Save to database
      const savedSuperAdmin = await userRepository.save(newSuperAdmin);
      console.log("Super admin created successfully");
      console.log(`Super admin ID: ${savedSuperAdmin.id}`);
      console.log(`Super admin email: admin@example.com`);
      console.log(`Super admin password: ${newPassword}`);
    } else {
      console.log("Super admin found. Resetting password...");

      // Hash new password
      const newPassword = "Admin@123456";
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      superAdmin.password = hashedPassword;
      await userRepository.save(superAdmin);

      console.log("Super admin password reset successfully");
      console.log(`Super admin ID: ${superAdmin.id}`);
      console.log(`Super admin email: admin@example.com`);
      console.log(`Super admin password: ${newPassword}`);
    }

    // Close connection
    await AppDataSource.destroy();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error resetting super admin password:", error);
  }
}

// Run the function
resetSuperAdminPassword();
