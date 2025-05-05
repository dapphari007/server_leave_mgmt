import { AppDataSource } from "../config/database";
import { User, UserRole, UserLevel, Gender } from "../models";
import { hashPassword } from "./auth";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export const ensureDefaultUsers = async (): Promise<void> => {
  try {
    // First, ensure the User entity has department and position columns
    await ensureDepartmentAndPositionColumns();

    const userRepository = AppDataSource.getRepository(User);

    // Define 10 default users with department and position
    const defaultUsers = [
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
        department: "Executive",
        position: "CEO",
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
        department: "Executive",
        position: "CTO",
      },
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
        department: "Engineering",
        position: "Engineering Manager",
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
        department: "Marketing",
        position: "Marketing Manager",
      },
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
        department: "Human Resources",
        position: "HR Director",
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
        department: "Human Resources",
        position: "HR Manager",
      },
      {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@example.com",
        password: "Employee@123",
        phoneNumber: "+1-555-456-7890",
        address: "505 Employee Road, Chicago, IL 60601",
        role: UserRole.EMPLOYEE,
        level: UserLevel.LEVEL_1,
        gender: Gender.MALE,
        department: "Engineering",
        position: "Software Engineer",
        managerId: null, // Will be set after managers are created
      },
      {
        firstName: "Emily",
        lastName: "Wilson",
        email: "emily.wilson@example.com",
        password: "Employee@123",
        phoneNumber: "+1-555-567-8901",
        address: "606 Employee Lane, Seattle, WA 98101",
        role: UserRole.EMPLOYEE,
        level: UserLevel.LEVEL_1,
        gender: Gender.FEMALE,
        department: "Engineering",
        position: "QA Engineer",
        managerId: null, // Will be set after managers are created
      },
      {
        firstName: "David",
        lastName: "Taylor",
        email: "david.taylor@example.com",
        password: "Employee@123",
        phoneNumber: "+1-555-678-9012",
        address: "707 Employee Blvd, Austin, TX 78701",
        role: UserRole.EMPLOYEE,
        level: UserLevel.LEVEL_1,
        gender: Gender.MALE,
        department: "Marketing",
        position: "Marketing Specialist",
        managerId: null, // Will be set after managers are created
      },
      {
        firstName: "Lisa",
        lastName: "Martinez",
        email: "lisa.martinez@example.com",
        password: "Employee@123",
        phoneNumber: "+1-555-789-0123",
        address: "808 Employee Court, Miami, FL 33131",
        role: UserRole.EMPLOYEE,
        level: UserLevel.LEVEL_1,
        gender: Gender.FEMALE,
        department: "Marketing",
        position: "Content Writer",
        managerId: null, // Will be set after managers are created
      },
    ];

    // First, check and create all users
    const createdUsers = [];
    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(
          `User ${userData.email} already exists, skipping creation...`
        );

        // Update department and position if they're not set
        if (!existingUser.department || !existingUser.position) {
          existingUser.department = userData.department;
          existingUser.position = userData.position;
          await userRepository.save(existingUser);
          console.log(`Updated department and position for ${userData.email}`);
        }

        createdUsers.push(existingUser);
        continue;
      }

      // Create new user
      const user = new User();
      Object.assign(user, {
        ...userData,
        password: await hashPassword(userData.password),
      });

      const savedUser = await userRepository.save(user);
      console.log(`User ${userData.email} created successfully`);
      createdUsers.push(savedUser);
    }

    // Now set manager IDs for employees
    const engineeringManager = createdUsers.find(
      (user) =>
        user.role === UserRole.MANAGER && user.department === "Engineering"
    );

    const marketingManager = createdUsers.find(
      (user) =>
        user.role === UserRole.MANAGER && user.department === "Marketing"
    );

    if (engineeringManager) {
      // Find engineering employees and set their manager
      const engineeringEmployees = createdUsers.filter(
        (user) =>
          user.role === UserRole.EMPLOYEE && user.department === "Engineering"
      );

      for (const employee of engineeringEmployees) {
        if (!employee.managerId) {
          employee.managerId = engineeringManager.id;
          await userRepository.save(employee);
          console.log(`Set manager for ${employee.email}`);
        }
      }
    }

    if (marketingManager) {
      // Find marketing employees and set their manager
      const marketingEmployees = createdUsers.filter(
        (user) =>
          user.role === UserRole.EMPLOYEE && user.department === "Marketing"
      );

      for (const employee of marketingEmployees) {
        if (!employee.managerId) {
          employee.managerId = marketingManager.id;
          await userRepository.save(employee);
          console.log(`Set manager for ${employee.email}`);
        }
      }
    }

    console.log("Default users check completed");
  } catch (error) {
    console.error("Error ensuring default users:", error);
    throw error;
  }
};

/**
 * Ensures that the User entity has department and position columns
 * Uses TypeORM's migration API to add columns if they don't exist
 */
const ensureDepartmentAndPositionColumns = async (): Promise<void> => {
  try {
    // Create a migration to add the columns
    const migration: MigrationInterface = {
      name: "AddDepartmentAndPositionColumns",
      async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("users");

        // Check if department column exists in the database
        const departmentColumn = table?.findColumnByName("department");
        if (!departmentColumn) {
          await queryRunner.addColumn(
            "users",
            new TableColumn({
              name: "department",
              type: "varchar",
              length: "100",
              isNullable: true,
            })
          );
          console.log("Department column added to users table");
        }

        // Check if position column exists in the database
        const positionColumn = table?.findColumnByName("position");
        if (!positionColumn) {
          await queryRunner.addColumn(
            "users",
            new TableColumn({
              name: "position",
              type: "varchar",
              length: "100",
              isNullable: true,
            })
          );
          console.log("Position column added to users table");
        }
      },

      async down(queryRunner: QueryRunner): Promise<void> {
        // This method is required but we don't need to implement it
      },
    };

    // Run the migration
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await migration.up(queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error("Error ensuring department and position columns:", error);
    throw error;
  }
};
