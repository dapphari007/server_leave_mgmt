"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByManagerId = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const auth_1 = require("../utils/auth");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Create a new user
 */
const createUser = async (userData) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Check if user with email already exists
        const existingUser = await userRepository.findOne({
            where: { email: userData.email },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        if (userData.password) {
            userData.password = await (0, auth_1.hashPassword)(userData.password);
        }
        // Create new user
        const user = userRepository.create(userData);
        return await userRepository.save(user);
    }
    catch (error) {
        logger_1.default.error(`Error in createUser service: ${error}`);
        throw error;
    }
};
exports.createUser = createUser;
/**
 * Get all users with optional filters
 */
const getAllUsers = async (filters = {}) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Build query
        const query = {};
        if (filters.role) {
            query.role = filters.role;
        }
        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        // Get users
        const users = await userRepository.find({
            where: query,
            relations: ['manager'],
            order: {
                firstName: 'ASC',
                lastName: 'ASC',
            },
        });
        // Remove passwords from response
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getAllUsers service: ${error}`);
        throw error;
    }
};
exports.getAllUsers = getAllUsers;
/**
 * Get user by ID
 */
const getUserById = async (userId) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Find user by ID
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ['manager'],
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Return user data (excluding password)
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    catch (error) {
        logger_1.default.error(`Error in getUserById service: ${error}`);
        throw error;
    }
};
exports.getUserById = getUserById;
/**
 * Update user
 */
const updateUser = async (userId, userData) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Find user by ID
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // If email is being updated, check if it's already in use
        if (userData.email && userData.email !== user.email) {
            const existingUser = await userRepository.findOne({
                where: { email: userData.email },
            });
            if (existingUser) {
                throw new Error('Email is already in use');
            }
        }
        // Update user data
        userRepository.merge(user, userData);
        // Save updated user
        const updatedUser = await userRepository.save(user);
        // Return updated user data (excluding password)
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    catch (error) {
        logger_1.default.error(`Error in updateUser service: ${error}`);
        throw error;
    }
};
exports.updateUser = updateUser;
/**
 * Delete user
 */
const deleteUser = async (userId) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Find user by ID
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Delete user
        await userRepository.remove(user);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteUser service: ${error}`);
        throw error;
    }
};
exports.deleteUser = deleteUser;
/**
 * Get users by manager ID
 */
const getUsersByManagerId = async (managerId) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Get users by manager ID
        const users = await userRepository.find({
            where: { managerId },
            order: {
                firstName: 'ASC',
                lastName: 'ASC',
            },
        });
        // Remove passwords from response
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
    catch (error) {
        logger_1.default.error(`Error in getUsersByManagerId service: ${error}`);
        throw error;
    }
};
exports.getUsersByManagerId = getUsersByManagerId;
//# sourceMappingURL=userService.js.map