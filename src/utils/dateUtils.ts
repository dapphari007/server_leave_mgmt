import { AppDataSource } from "../config/database";
import { Holiday } from "../models";
import { Between as TypeORMBetween } from "typeorm";

export const calculateBusinessDays = async (
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset hours to ensure we're comparing full days
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // If start date is after end date, return 0
  if (start > end) return 0;

  // If same day, return 1
  if (start.getTime() === end.getTime()) return 1;

  let count = 0;
  const currentDate = new Date(start);

  // Get all holidays between start and end dates
  const holidayRepository = AppDataSource.getRepository(Holiday);
  const holidays = await holidayRepository.find({
    where: {
      date: TypeORMBetween(start, end),
      isActive: true,
    },
  });

  const holidayDates = holidays.map((holiday) => {
    const date = new Date(holiday.date);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  // Count business days (excluding weekends and holidays)
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    const isHoliday = holidayDates.includes(currentDate.getTime());

    if (!isWeekend && !isHoliday) {
      count++;
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

export const calculateHalfDayValue = (isHalfDay: boolean): number => {
  return isHalfDay ? 0.5 : 1;
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
