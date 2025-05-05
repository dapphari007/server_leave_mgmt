import { AppDataSource } from "../config/database";
import { LeaveType } from "../models";
import logger from "../utils/logger";

export const createDefaultLeaveTypes = async (): Promise<void> => {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connection initialized in createDefaultLeaveTypes");
    }

    const leaveTypeRepository = AppDataSource.getRepository(LeaveType);

    // Define default leave types
    const defaultLeaveTypes = [
      {
        name: "Annual Leave",
        description: "Regular paid time off for vacation or personal matters",
        defaultDays: 20,
        isCarryForward: true,
        maxCarryForwardDays: 5,
        isActive: true,
        applicableGender: null, // For all genders
        isHalfDayAllowed: true,
        isPaidLeave: true,
      },
      {
        name: "Sick Leave",
        description: "Leave for medical reasons or illness",
        defaultDays: 10,
        isCarryForward: false,
        maxCarryForwardDays: 0,
        isActive: true,
        applicableGender: null, // For all genders
        isHalfDayAllowed: true,
        isPaidLeave: true,
      },
      {
        name: "Maternity Leave",
        description: "Leave for female employees before and after childbirth",
        defaultDays: 90,
        isCarryForward: false,
        maxCarryForwardDays: 0,
        isActive: true,
        applicableGender: "female",
        isHalfDayAllowed: false,
        isPaidLeave: true,
      },
      {
        name: "Paternity Leave",
        description: "Leave for male employees after the birth of their child",
        defaultDays: 10,
        isCarryForward: false,
        maxCarryForwardDays: 0,
        isActive: true,
        applicableGender: "male",
        isHalfDayAllowed: false,
        isPaidLeave: true,
      },
      {
        name: "Bereavement Leave",
        description: "Leave due to the death of a family member",
        defaultDays: 5,
        isCarryForward: false,
        maxCarryForwardDays: 0,
        isActive: true,
        applicableGender: null, // For all genders
        isHalfDayAllowed: false,
        isPaidLeave: true,
      },
      {
        name: "Unpaid Leave",
        description: "Leave without pay for personal reasons",
        defaultDays: 30,
        isCarryForward: false,
        maxCarryForwardDays: 0,
        isActive: true,
        applicableGender: null, // For all genders
        isHalfDayAllowed: true,
        isPaidLeave: false,
      },
      {
        name: "Work From Home",
        description: "Working remotely from home",
        defaultDays: 15,
        isCarryForward: false,
        maxCarryForwardDays: 0,
        isActive: true,
        applicableGender: null, // For all genders
        isHalfDayAllowed: true,
        isPaidLeave: true,
      },
      {
        name: "Compensatory Off",
        description: "Leave granted for working on holidays or weekends",
        defaultDays: 0, // Accumulates based on work
        isCarryForward: true,
        maxCarryForwardDays: 5,
        isActive: true,
        applicableGender: null, // For all genders
        isHalfDayAllowed: true,
        isPaidLeave: true,
      },
    ];

    // Create leave types if they don't exist
    let created = 0;
    let skipped = 0;

    for (const leaveTypeData of defaultLeaveTypes) {
      // Check if leave type already exists
      const existingLeaveType = await leaveTypeRepository.findOne({
        where: { name: leaveTypeData.name },
      });

      if (!existingLeaveType) {
        // Create new leave type
        const leaveType = new LeaveType();
        Object.assign(leaveType, leaveTypeData);
        await leaveTypeRepository.save(leaveType);
        created++;
        logger.info(`Created leave type: ${leaveTypeData.name}`);
      } else {
        skipped++;
        logger.info(`Skipped existing leave type: ${leaveTypeData.name}`);
      }
    }

    logger.info(
      `Default leave types creation completed. Created: ${created}, Skipped: ${skipped}`
    );
  } catch (error) {
    logger.error(`Error creating default leave types: ${error}`);
    throw error;
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

// Execute if this script is run directly
if (require.main === module) {
  createDefaultLeaveTypes()
    .then(() => {
      logger.info("Default leave types creation script completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Error in default leave types creation script: ${error}`);
      process.exit(1);
    });
}
