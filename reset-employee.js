const { AppDataSource } = require("./src/config/database");
const { User } = require("./src/models");
const bcrypt = require("bcrypt");

/**
 * Script to reset an employee's password
 */
async function resetEmployeePassword() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Connected to database");

    // Get the User repository
    const userRepository = AppDataSource.getRepository(User);

    // Find employee by email
    const employee = await userRepository.findOne({
      where: { email: "dappinmonster007@gmail.com" },
    });

    if (!employee) {
      console.log("Employee not found with email: dappinmonster007@gmail.com");
      console.log(
        "Please check if the email is correct or create the employee first."
      );
    } else {
      console.log("Employee found. Resetting password...");

      // Hash new password
      const newPassword = "Admin@123";
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and ensure account is active
      employee.password = hashedPassword;
      employee.isActive = true;
      await userRepository.save(employee);

      console.log("Employee password reset successfully");
      console.log(`Employee ID: ${employee.id}`);
      console.log(`Employee email: ${employee.email}`);
      console.log(`Employee password: ${newPassword}`);
      console.log(`Employee is now active: ${employee.isActive}`);
      console.log(`Employee role: ${employee.role}`);
    }

    // Close connection
    await AppDataSource.destroy();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error resetting employee password:", error);
  }
}

// Run the function
resetEmployeePassword();
