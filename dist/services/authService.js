"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPassword = exports.changeUserPassword = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const auth_1 = require("../utils/auth");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Register a new user
 */
const registerUser = async (userData) => {
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
        logger_1.default.error(`Error in registerUser service: ${error}`);
        throw error;
    }
};
exports.registerUser = registerUser;
/**
 * Authenticate user and generate token
 */
const loginUser = async (email, password) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Find user by email
        const user = await userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check if user is active
        if (!user.isActive) {
            throw new Error('User account is inactive');
        }
        // Verify password
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // Generate JWT token
        const token = (0, auth_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            level: user.level,
        });
        // Return user data (excluding password) and token
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token,
        };
    }
    catch (error) {
        logger_1.default.error(`Error in loginUser service: ${error}`);
        throw error;
    }
};
exports.loginUser = loginUser;
/**
 * Get user profile by ID
 */
const getUserProfile = async (userId) => {
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
        logger_1.default.error(`Error in getUserProfile service: ${error}`);
        throw error;
    }
};
exports.getUserProfile = getUserProfile;
/**
 * Update user profile
 */
const updateUserProfile = async (userId, userData) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Find user by ID
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
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
        logger_1.default.error(`Error in updateUserProfile service: ${error}`);
        throw error;
    }
};
exports.updateUserProfile = updateUserProfile;
/**
 * Change user password
 */
const changeUserPassword = async (userId, currentPassword, newPassword) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Find user by ID
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        const isPasswordValid = await (0, auth_1.comparePassword)(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        // Hash new password
        const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
        // Update password
        user.password = hashedPassword;
        // Save updated user
        await userRepository.save(user);
    }
    catch (error) {
        logger_1.default.error(`Error in changeUserPassword service: ${error}`);
        throw error;
    }
};
exports.changeUserPassword = changeUserPassword;
/**
 * Reset user password (admin only)
 */
const resetUserPassword = async (userId, newPassword) => {
    try {
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        // Find user by ID
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Hash new password
        const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
        // Update password
        user.password = hashedPassword;
        // Save updated user
        await userRepository.save(user);
    }
    catch (error) {
        logger_1.default.error(`Error in resetUserPassword service: ${error}`);
        throw error;
    }
};
exports.resetUserPassword = resetUserPassword;
//# sourceMappingURL=authService.js.map