require("dotenv").config();
const { createConnection } = require("typeorm");
const bcrypt = require("bcrypt");

async function createManager() {
  try {
    // Connect to database
    const connection = await createConnection();
    console.log("Connected to database");

    // Get the User entity repository
    const userRepository = connection.getRepository("User");

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("Manager@123", saltRounds);

    // Create manager user
    const manager = {
      firstName: "Test",
      lastName: "Manager",
      email: "manager@example.com",
      password: hashedPassword,
      phoneNumber: "+1234567890",
      address: "123 Manager St, City, Country",
      role: "manager",
      level: 2,
      gender: "male",
      isActive: true,
    };

    // Save manager to database
    const savedManager = await userRepository.save(manager);
    console.log("Manager created successfully");
    console.log("Manager ID:", savedManager.id);

    // Close connection
    await connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error creating manager:", error);
  }
}

createManager();
