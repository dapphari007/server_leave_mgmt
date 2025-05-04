"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.getCurrentYear = exports.calculateHalfDayValue = exports.calculateBusinessDays = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const typeorm_1 = require("typeorm");
const calculateBusinessDays = async (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Reset hours to ensure we're comparing full days
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    // If start date is after end date, return 0
    if (start > end)
        return 0;
    // If same day, return 1
    if (start.getTime() === end.getTime())
        return 1;
    let count = 0;
    const currentDate = new Date(start);
    // Get all holidays between start and end dates
    const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
    const holidays = await holidayRepository.find({
        where: {
            date: (0, typeorm_1.Between)(start, end),
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
exports.calculateBusinessDays = calculateBusinessDays;
const calculateHalfDayValue = (isHalfDay) => {
    return isHalfDay ? 0.5 : 1;
};
exports.calculateHalfDayValue = calculateHalfDayValue;
const getCurrentYear = () => {
    return new Date().getFullYear();
};
exports.getCurrentYear = getCurrentYear;
const formatDate = (date) => {
    return date.toISOString().split("T")[0];
};
exports.formatDate = formatDate;
//# sourceMappingURL=dateUtils.js.map