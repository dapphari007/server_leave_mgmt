import { Holiday } from "../models";
/**
 * Create a new holiday
 */
export declare const createHoliday: (holidayData: Partial<Holiday>) => Promise<Holiday>;
/**
 * Get all holidays with optional filters
 */
export declare const getAllHolidays: (filters?: {
    year?: number;
    isActive?: boolean;
}) => Promise<Holiday[]>;
/**
 * Get holiday by ID
 */
export declare const getHolidayById: (holidayId: string) => Promise<Holiday>;
/**
 * Update holiday
 */
export declare const updateHoliday: (holidayId: string, holidayData: Partial<Holiday>) => Promise<Holiday>;
/**
 * Delete holiday
 */
export declare const deleteHoliday: (holidayId: string) => Promise<void>;
/**
 * Bulk create holidays
 */
export declare const bulkCreateHolidays: (holidays: Partial<Holiday>[]) => Promise<Holiday[]>;
/**
 * Get upcoming holidays
 */
export declare const getUpcomingHolidays: (limit?: number) => Promise<Holiday[]>;
