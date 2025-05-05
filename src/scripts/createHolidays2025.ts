import { AppDataSource } from "../config/database";
import { Holiday } from "../models";
import logger from "../utils/logger";

export const createHolidays2025 = async (): Promise<void> => {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connection initialized in createHolidays2025");
    }

    const holidayRepository = AppDataSource.getRepository(Holiday);

    // Define holidays for 2025
    const holidays2025 = [
      {
        name: "New Year's Day",
        date: "2025-01-01",
        description: "First day of the year",
      },
      {
        name: "Martin Luther King Jr. Day",
        date: "2025-01-20",
        description: "Honoring Dr. Martin Luther King Jr.",
      },
      {
        name: "Presidents' Day",
        date: "2025-02-17",
        description: "Honoring U.S. presidents",
      },
      {
        name: "Good Friday",
        date: "2025-04-18",
        description: "Christian holiday commemorating the crucifixion of Jesus",
      },
      {
        name: "Easter Monday",
        date: "2025-04-21",
        description: "Day after Easter Sunday",
      },
      {
        name: "Memorial Day",
        date: "2025-05-26",
        description:
          "Honoring those who died while serving in the U.S. military",
      },
      {
        name: "Independence Day",
        date: "2025-07-04",
        description: "U.S. Independence Day",
      },
      {
        name: "Labor Day",
        date: "2025-09-01",
        description: "Honoring the American labor movement",
      },
      {
        name: "Columbus Day",
        date: "2025-10-13",
        description:
          "Commemorating the arrival of Christopher Columbus in the Americas",
      },
      {
        name: "Veterans Day",
        date: "2025-11-11",
        description: "Honoring military veterans",
      },
      {
        name: "Thanksgiving Day",
        date: "2025-11-27",
        description: "Day of giving thanks",
      },
      {
        name: "Day after Thanksgiving",
        date: "2025-11-28",
        description: "Black Friday",
      },
      {
        name: "Christmas Eve",
        date: "2025-12-24",
        description: "Day before Christmas",
      },
      {
        name: "Christmas Day",
        date: "2025-12-25",
        description: "Christian holiday celebrating the birth of Jesus",
      },
      {
        name: "New Year's Eve",
        date: "2025-12-31",
        description: "Last day of the year",
      },
    ];

    // Create holidays if they don't exist
    let created = 0;
    let skipped = 0;

    for (const holidayData of holidays2025) {
      // Check if holiday already exists on the same date
      const existingHoliday = await holidayRepository.findOne({
        where: { date: new Date(holidayData.date) },
      });

      if (!existingHoliday) {
        // Create new holiday
        const holiday = new Holiday();
        holiday.name = holidayData.name;
        holiday.date = new Date(holidayData.date);
        holiday.description = holidayData.description;
        holiday.isActive = true;

        await holidayRepository.save(holiday);
        created++;
        logger.info(
          `Created holiday: ${holidayData.name} (${holidayData.date})`
        );
      } else {
        skipped++;
        logger.info(`Skipped existing holiday on date: ${holidayData.date}`);
      }
    }

    logger.info(
      `2025 holidays creation completed. Created: ${created}, Skipped: ${skipped}`
    );
  } catch (error) {
    logger.error(`Error creating 2025 holidays: ${error}`);
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
  createHolidays2025()
    .then(() => {
      logger.info("2025 holidays creation script completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Error in 2025 holidays creation script: ${error}`);
      process.exit(1);
    });
}
