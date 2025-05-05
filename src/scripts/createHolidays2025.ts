import { AppDataSource } from "../config/database";
import { Holiday } from "../models";
import logger from "../utils/logger";

export const createHolidays = async (
  closeConnection = false
): Promise<void> => {
  let wasInitialized = AppDataSource.isInitialized;

  try {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connection initialized in createHolidays");
    }

    const holidayRepository = AppDataSource.getRepository(Holiday);

    // Define holidays
    const holidays = [
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

    // First, check if any holidays already exist
    const year = new Date("2025-01-01").getFullYear();
    const existingHolidays = await holidayRepository.find();
    const existingDates = existingHolidays
      .filter((holiday) => holiday.date.getFullYear() === year)
      .map((holiday) => holiday.date.toISOString().split("T")[0]);

    logger.info(`Found ${existingDates.length} existing holidays`);

    for (const holidayData of holidays) {
      try {
        // Check if this specific holiday date already exists
        if (existingDates.includes(holidayData.date)) {
          skipped++;
          logger.info(`Skipped existing holiday on date: ${holidayData.date}`);
          continue;
        }

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
      } catch (holidayError) {
        // Log the error but continue with the next holiday
        logger.error(
          `Error processing holiday ${holidayData.name}: ${holidayError}`
        );
        skipped++;
      }
    }

    logger.info(
      `Holidays creation completed. Created: ${created}, Skipped: ${skipped}, Total existing holidays: ${existingDates.length}`
    );
  } catch (error) {
    logger.error(`Error creating holidays: ${error}`);
    // Don't throw the error, just log it
  } finally {
    // Only close the connection if we opened it and closeConnection is true
    if (!wasInitialized && AppDataSource.isInitialized && closeConnection) {
      await AppDataSource.destroy();
      logger.info("Database connection closed in createHolidays");
    }
  }
};

// Execute if this script is run directly
if (require.main === module) {
  createHolidays(true) // true to close the connection when run directly
    .then(() => {
      logger.info("Holidays creation script completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Error in holidays creation script: ${error}`);
      process.exit(1);
    });
}
