"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingHolidays = exports.bulkCreateHolidays = exports.deleteHoliday = exports.updateHoliday = exports.getHolidayById = exports.getAllHolidays = exports.createHoliday = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
const typeorm_1 = require("typeorm");
/**
 * Create a new holiday
 */
const createHoliday = async (holidayData) => {
    try {
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        // Check if holiday already exists on this date
        const existingHoliday = await holidayRepository.findOne({
            where: { date: holidayData.date },
        });
        if (existingHoliday) {
            throw new Error("A holiday already exists on this date");
        }
        // Create new holiday
        const holiday = holidayRepository.create(holidayData);
        return await holidayRepository.save(holiday);
    }
    catch (error) {
        logger_1.default.error(`Error in createHoliday service: ${error}`);
        throw error;
    }
};
exports.createHoliday = createHoliday;
/**
 * Get all holidays with optional filters
 */
const getAllHolidays = async (filters = {}) => {
    try {
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        // Build query
        const query = {};
        if (filters.year) {
            const startOfYear = new Date(filters.year, 0, 1);
            const endOfYear = new Date(filters.year, 11, 31);
            query.date = (0, typeorm_1.Between)(startOfYear, endOfYear);
        }
        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        // Get holidays
        return await holidayRepository.find({
            where: query,
            order: {
                date: "ASC",
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getAllHolidays service: ${error}`);
        throw error;
    }
};
exports.getAllHolidays = getAllHolidays;
/**
 * Get holiday by ID
 */
const getHolidayById = async (holidayId) => {
    try {
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        // Find holiday by ID
        const holiday = await holidayRepository.findOne({
            where: { id: holidayId },
        });
        if (!holiday) {
            throw new Error("Holiday not found");
        }
        return holiday;
    }
    catch (error) {
        logger_1.default.error(`Error in getHolidayById service: ${error}`);
        throw error;
    }
};
exports.getHolidayById = getHolidayById;
/**
 * Update holiday
 */
const updateHoliday = async (holidayId, holidayData) => {
    try {
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        // Find holiday by ID
        const holiday = await holidayRepository.findOne({
            where: { id: holidayId },
        });
        if (!holiday) {
            throw new Error("Holiday not found");
        }
        // If date is being updated, check if it's already in use
        if (holidayData.date &&
            holiday.date.getTime() !== new Date(holidayData.date).getTime()) {
            const existingHoliday = await holidayRepository.findOne({
                where: { date: holidayData.date },
            });
            if (existingHoliday) {
                throw new Error("A holiday already exists on this date");
            }
        }
        // Update holiday data
        holidayRepository.merge(holiday, holidayData);
        // Save updated holiday
        return await holidayRepository.save(holiday);
    }
    catch (error) {
        logger_1.default.error(`Error in updateHoliday service: ${error}`);
        throw error;
    }
};
exports.updateHoliday = updateHoliday;
/**
 * Delete holiday
 */
const deleteHoliday = async (holidayId) => {
    try {
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        // Find holiday by ID
        const holiday = await holidayRepository.findOne({
            where: { id: holidayId },
        });
        if (!holiday) {
            throw new Error("Holiday not found");
        }
        // Delete holiday
        await holidayRepository.remove(holiday);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteHoliday service: ${error}`);
        throw error;
    }
};
exports.deleteHoliday = deleteHoliday;
/**
 * Bulk create holidays
 */
const bulkCreateHolidays = async (holidays) => {
    try {
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        // Check for duplicate dates
        const dates = holidays.map((h) => new Date(h.date).toISOString().split("T")[0]);
        const uniqueDates = new Set(dates);
        if (dates.length !== uniqueDates.size) {
            throw new Error("Duplicate dates found in the holiday list");
        }
        // Check if any of the dates already have holidays
        for (const holiday of holidays) {
            const existingHoliday = await holidayRepository.findOne({
                where: { date: holiday.date },
            });
            if (existingHoliday) {
                throw new Error(`A holiday already exists on ${new Date(holiday.date).toDateString()}`);
            }
        }
        // Create holidays
        const createdHolidays = [];
        for (const holidayData of holidays) {
            const holiday = holidayRepository.create({
                ...holidayData,
                isActive: holidayData.isActive !== undefined ? holidayData.isActive : true,
            });
            createdHolidays.push(await holidayRepository.save(holiday));
        }
        return createdHolidays;
    }
    catch (error) {
        logger_1.default.error(`Error in bulkCreateHolidays service: ${error}`);
        throw error;
    }
};
exports.bulkCreateHolidays = bulkCreateHolidays;
/**
 * Get upcoming holidays
 */
const getUpcomingHolidays = async (limit = 5) => {
    try {
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Get upcoming holidays
        return await holidayRepository.find({
            where: {
                date: (0, typeorm_1.MoreThanOrEqual)(today),
                isActive: true,
            },
            order: {
                date: "ASC",
            },
            take: limit,
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getUpcomingHolidays service: ${error}`);
        throw error;
    }
};
exports.getUpcomingHolidays = getUpcomingHolidays;
// TypeORM operators are imported at the top of the file
//# sourceMappingURL=holidayService.js.map