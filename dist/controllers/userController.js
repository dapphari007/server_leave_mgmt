"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPassword = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const auth_1 = require("../utils/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const createUser = async (request, h) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, address, role, level, gender, managerId } = request.payload;
        // Validate input
        if (!firstName || !lastName || !email || !password || !role) {
            return h.response({ message: 'First name, last name, email, password, and role are required' }).code(400);
        }
        if (!(0, auth_1.validateEmail)(email)) {
            return h.response({ message: 'Invalid email format' }).code(400);
        }
        if (!(0, auth_1.validatePassword)(password)) {
            return h.response({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' }).code(400);
        }
        // Check if user already exists
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return h.response({ message: 'User with this email already exists' }).code(409);
        }
        // Validate role
        if (!Object.values(models_1.UserRole).includes(role)) {
            return h.response({ message: 'Invalid role' }).code(400);
        }
        // Validate level if provided
        if (level && !Object.values(models_1.UserLevel).includes(level)) {
            return h.response({ message: 'Invalid level' }).code(400);
        }
        // Validate manager if provided
        if (managerId) {
            const manager = await userRepository.findOne({ where: { id: managerId } });
            if (!manager) {
                return h.response({ message: 'Manager not found' }).code(404);
            }
            // Check if manager has appropriate role
            if (manager.role !== models_1.UserRole.MANAGER && manager.role !== models_1.UserRole.SUPER_ADMIN) {
                return h.response({ message: 'Invalid manager role' }).code(400);
            }
        }
        // Hash password
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Create new user
        const user = new models_1.User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.password = hashedPassword;
        user.phoneNumber = phoneNumber || null;
        user.address = address || null;
        user.role = role;
        user.level = level || models_1.UserLevel.LEVEL_1;
        user.gender = gender || null;
        user.managerId = managerId || null;
        // Save user to database
        const savedUser = await userRepository.save(user);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = savedUser;
        return h.response({
            message: 'User created successfully',
            user: userWithoutPassword,
        }).code(201);
    }
    catch (error) {
        logger_1.default.error(`Error in createUser: ${error}`);
        return h.response({ message: 'An error occurred while creating the user' }).code(500);
    }
};
exports.createUser = createUser;
const getAllUsers = async (request, h) => {
    try {
        const { role, isActive } = request.query;
        // Build query
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        let query = {};
        if (role) {
            query.role = role;
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        // Get users
        const users = await userRepository.find({
            where: query,
            order: {
                createdAt: 'DESC',
            },
        });
        // Remove passwords from response
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return h.response({
            users: usersWithoutPasswords,
            count: usersWithoutPasswords.length,
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getAllUsers: ${error}`);
        return h.response({ message: 'An error occurred while fetching users' }).code(500);
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (request, h) => {
    try {
        const { id } = request.params;
        // Get user
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
            return h.response({ message: 'User not found' }).code(404);
        }
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return h.response({
            user: userWithoutPassword,
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getUserById: ${error}`);
        return h.response({ message: 'An error occurred while fetching the user' }).code(500);
    }
};
exports.getUserById = getUserById;
const updateUser = async (request, h) => {
    try {
        const { id } = request.params;
        const { firstName, lastName, phoneNumber, address, role, level, isActive, managerId } = request.payload;
        // Get user
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
            return h.response({ message: 'User not found' }).code(404);
        }
        // Validate role if provided
        if (role && !Object.values(models_1.UserRole).includes(role)) {
            return h.response({ message: 'Invalid role' }).code(400);
        }
        // Validate level if provided
        if (level && !Object.values(models_1.UserLevel).includes(level)) {
            return h.response({ message: 'Invalid level' }).code(400);
        }
        // Validate manager if provided
        if (managerId) {
            const manager = await userRepository.findOne({ where: { id: managerId } });
            if (!manager) {
                return h.response({ message: 'Manager not found' }).code(404);
            }
            // Check if manager has appropriate role
            if (manager.role !== models_1.UserRole.MANAGER && manager.role !== models_1.UserRole.SUPER_ADMIN) {
                return h.response({ message: 'Invalid manager role' }).code(400);
            }
            // Prevent circular management relationships
            if (managerId === id) {
                return h.response({ message: 'A user cannot be their own manager' }).code(400);
            }
        }
        // Update user fields
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phoneNumber !== undefined)
            user.phoneNumber = phoneNumber;
        if (address !== undefined)
            user.address = address;
        if (role)
            user.role = role;
        if (level)
            user.level = level;
        if (isActive !== undefined)
            user.isActive = isActive;
        if (managerId !== undefined)
            user.managerId = managerId;
        // Save updated user
        const updatedUser = await userRepository.save(user);
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        return h.response({
            message: 'User updated successfully',
            user: userWithoutPassword,
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in updateUser: ${error}`);
        return h.response({ message: 'An error occurred while updating the user' }).code(500);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (request, h) => {
    try {
        const { id } = request.params;
        // Get user
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
            return h.response({ message: 'User not found' }).code(404);
        }
        // Check if user is a manager
        const managedUsers = await userRepository.find({ where: { managerId: id } });
        if (managedUsers.length > 0) {
            return h.response({ message: 'Cannot delete a user who is a manager. Please reassign their team members first.' }).code(400);
        }
        // Delete user
        await userRepository.remove(user);
        return h.response({
            message: 'User deleted successfully',
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in deleteUser: ${error}`);
        return h.response({ message: 'An error occurred while deleting the user' }).code(500);
    }
};
exports.deleteUser = deleteUser;
const resetUserPassword = async (request, h) => {
    try {
        const { id } = request.params;
        const { newPassword } = request.payload;
        // Validate input
        if (!newPassword) {
            return h.response({ message: 'New password is required' }).code(400);
        }
        if (!(0, auth_1.validatePassword)(newPassword)) {
            return h.response({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' }).code(400);
        }
        // Get user
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
            return h.response({ message: 'User not found' }).code(404);
        }
        // Hash new password
        const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
        // Update password
        user.password = hashedPassword;
        await userRepository.save(user);
        return h.response({
            message: 'Password reset successfully',
        }).code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in resetUserPassword: ${error}`);
        return h.response({ message: 'An error occurred while resetting the password' }).code(500);
    }
};
exports.resetUserPassword = resetUserPassword;
//# sourceMappingURL=userController.js.map