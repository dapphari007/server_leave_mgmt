const { AppDataSource } = require("./src/config/database");
const { User } = require("./src/models");

/**
 * Script to check if a specific employee exists and display its status
 */
async function checkEmployee() {
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
    } else {
      console.log("Employee found:");
      console.log(`Employee ID: ${employee.id}`);
      console.log(`Employee email: ${employee.email}`);
      console.log(`Employee is active: ${employee.isActive}`);
      console.log(`Employee role: ${employee.role}`);
      console.log(`Employee first name: ${employee.firstName}`);
      console.log(`Employee last name: ${employee.lastName}`);
    }

    // Close connection
    await AppDataSource.destroy();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error checking employee:", error);
  }
}

// Run the function
checkEmployee();
