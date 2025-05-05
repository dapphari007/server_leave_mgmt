/**
 * Script to activate all users and reset their passwords if needed
 *
 * This script uses the compiled JavaScript files in the dist directory
 */

// Import required modules
const { AppDataSource } = require("./dist/config/database");
const bcrypt = require("bcrypt");

async function activateAllUsers() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Connected to database");

    // Get the User repository
    const userRepository = AppDataSource.getRepository("User");

    // Find all users
    const users = await userRepository.find();

    if (users.length === 0) {
      console.log("No users found in the database.");
      return;
    }

    console.log(`Found ${users.length} users in the database.`);

    // Process each user
    for (const user of users) {
      console.log(`\nProcessing user: ${user.email} (${user.role})`);

      // Check if user is active
      if (!user.isActive) {
        console.log(`  User was inactive. Activating user...`);
        user.isActive = true;
      } else {
        console.log(`  User is already active.`);
      }

      // Reset password
      const newPassword = "Admin@123";
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
      console.log(`  Password reset to: ${newPassword}`);

      // Save changes
      await userRepository.save(user);
      console.log(`  User updated successfully.`);
      console.log(`  User ID: ${user.id}`);
      console.log(`  User email: ${user.email}`);
      console.log(`  User role: ${user.role}`);
      console.log(`  User is now active: ${user.isActive}`);
    }

    console.log(
      "\nAll users have been activated and passwords reset to 'Admin@123'"
    );

    // Close connection
    await AppDataSource.destroy();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error activating users:", error);
  }
}

// Run the function
activateAllUsers();
