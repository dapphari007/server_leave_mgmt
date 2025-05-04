"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateHolidays = exports.deleteHoliday = exports.updateHoliday = exports.getHolidayById = exports.getAllHolidays = exports.createHoliday = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
const createHoliday = async (request, h) => {
    try {
        const { name, date, description, isActive } = request.payload;
        // Validate input
        if (!name || !date) {
            return h.response({ message: 'Name and date are required' }).code(400);
        }
        // Check if holiday already exists on the same date
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        const existingHoliday = await holidayRepository.findOne({
            where: { date: new Date(date) },
        });
        if (existingHoliday) {
            return h.response({ message: 'A holiday already exists on this date' }).code(409);
        }
        // Create new holiday
        const holiday = new models_1.Holiday();
        holiday.name = name;
        holiday.date = new Date(date);
        holiday.description = description || null;
        holiday.isActive = isActive !== undefined ? isActive : true;
        // Save holiday to database
        const savedHoliday = await holidayRepository.save(holiday);
        return h.response({
            message: 'Holiday created successfully',
            holiday: savedHoliday,
        }).code(201);
    }
    catch (error) {
        logger_1.default.error(`Error in createHoliday: ${error}`);
        return h.response({ message: 'An error occurred while creating the holiday' }).code(500);
    }
};
exports.createHoliday = createHoliday;
const getAllHolidays = async (request, h) => {
    try {
        const { year, isActive } = request.query;
        // Build query
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        let query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        // Get holidays
        let holidays = await holidayRepository.find({
            where: query,
            order: {
                date: 'ASC',
            },
        });
        // Filter by year if provided
        if (year) {
            const targetYear = parseInt(year);
            holidays = holidays.filter(holiday => holiday.date.getFullYear() === targetYear);
        }
        return h.response({
            holidays,
            count: holidays.length,
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getAllHolidays: ${error}`);
        return h.response({ message: 'An error occurred while fetching holidays' }).code(500);
    }
};
exports.getAllHolidays = getAllHolidays;
const getHolidayById = async (request, h) => {
    try {
        const { id } = request.params;
        // Get holiday
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        const holiday = await holidayRepository.findOne({ where: { id } });
        if (!holiday) {
            return h.response({ message: 'Holiday not found' }).code(404);
        }
        return h.response({
            holiday,
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getHolidayById: ${error}`);
        return h.response({ message: 'An error occurred while fetching the holiday' }).code(500);
    }
};
exports.getHolidayById = getHolidayById;
const updateHoliday = async (request, h) => {
    try {
        const { id } = request.params;
        const { name, date, description, isActive } = request.payload;
        // Get holiday
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        const holiday = await holidayRepository.findOne({ where: { id } });
        if (!holiday) {
            return h.response({ message: 'Holiday not found' }).code(404);
        }
        // Check if date is being changed and if it conflicts with another holiday
        if (date && new Date(date).getTime() !== holiday.date.getTime()) {
            const existingHoliday = await holidayRepository.findOne({
                where: { date: new Date(date) },
            });
            if (existingHoliday && existingHoliday.id !== id) {
                return h.response({ message: 'A holiday already exists on this date' }).code(409);
            }
        }
        // Update holiday fields
        if (name)
            holiday.name = name;
        if (date)
            holiday.date = new Date(date);
        if (description !== undefined)
            holiday.description = description;
        if (isActive !== undefined)
            holiday.isActive = isActive;
        // Save updated holiday
        const updatedHoliday = await holidayRepository.save(holiday);
        return h.response({
            message: 'Holiday updated successfully',
            holiday: updatedHoliday,
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in updateHoliday: ${error}`);
        return h.response({ message: 'An error occurred while updating the holiday' }).code(500);
    }
};
exports.updateHoliday = updateHoliday;
const deleteHoliday = async (request, h) => {
    try {
        const { id } = request.params;
        // Get holiday
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        const holiday = await holidayRepository.findOne({ where: { id } });
        if (!holiday) {
            return h.response({ message: 'Holiday not found' }).code(404);
        }
        // Delete holiday
        await holidayRepository.remove(holiday);
        return h.response({
            message: 'Holiday deleted successfully',
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteHoliday: ${error}`);
        return h.response({ message: 'An error occurred while deleting the holiday' }).code(500);
    }
};
exports.deleteHoliday = deleteHoliday;
const bulkCreateHolidays = async (request, h) => {
    try {
        const { holidays } = request.payload;
        // Validate input
        if (!holidays || !Array.isArray(holidays) || holidays.length === 0) {
            return h.response({ message: 'Holidays array is required' }).code(400);
        }
        const holidayRepository = database_1.AppDataSource.getRepository(models_1.Holiday);
        const results = {
            created: 0,
            skipped: 0,
        };
        for (const holidayData of holidays) {
            const { name, date, description } = holidayData;
            if (!name || !date) {
                results.skipped++;
                continue;
            }
            // Check if holiday already exists on the same date
            const existingHoliday = await holidayRepository.findOne({
                where: { date: new Date(date) },
            });
            if (existingHoliday) {
                results.skipped++;
                continue;
            }
            // Create new holiday
            const holiday = new models_1.Holiday();
            holiday.name = name;
            holiday.date = new Date(date);
            holiday.description = description || null;
            holiday.isActive = true;
            // Save holiday to database
            await holidayRepository.save(holiday);
            results.created++;
        }
        return h.response({
            message: 'Bulk holiday creation completed',
            results,
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in bulkCreateHolidays: ${error}`);
        return h.response({ message: 'An error occurred while creating holidays' }).code(500);
    }
};
exports.bulkCreateHolidays = bulkCreateHolidays;
//# sourceMappingURL=holidayController.js.map