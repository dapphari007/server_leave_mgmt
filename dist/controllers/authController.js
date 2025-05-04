"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const database_1 = require("../config/database");
const models_1 = require("../models");
const auth_1 = require("../utils/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const register = async (request, h) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, address, gender, } = request.payload;
        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return h
                .response({
                message: "First name, last name, email, and password are required",
            })
                .code(400);
        }
        if (!(0, auth_1.validateEmail)(email)) {
            return h.response({ message: "Invalid email format" }).code(400);
        }
        if (!(0, auth_1.validatePassword)(password)) {
            return h
                .response({
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
            })
                .code(400);
        }
        // Check if user already exists
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return h
                .response({ message: "User with this email already exists" })
                .code(409);
        }
        // Hash password
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Create new user
        const user = new models_1.User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.password = hashedPassword;
        user.phoneNumber = phoneNumber;
        user.address = address;
        user.gender = gender;
        // Save user to database
        const savedUser = await userRepository.save(user);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = savedUser;
        return h
            .response({
            message: "User registered successfully",
            user: userWithoutPassword,
        })
            .code(201);
    }
    catch (error) {
        logger_1.default.error(`Error in register: ${error}`);
        return h
            .response({ message: "An error occurred while registering the user" })
            .code(500);
    }
};
exports.register = register;
const login = async (request, h) => {
    try {
        const { email, password } = request.payload;
        // Validate input
        if (!email || !password) {
            return h
                .response({ message: "Email and password are required" })
                .code(400);
        }
        // Find user by email
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return h.response({ message: "Invalid email or password" }).code(401);
        }
        // Check if user is active
        if (!user.isActive) {
            return h
                .response({
                message: "Your account has been deactivated. Please contact an administrator.",
            })
                .code(403);
        }
        // Verify password
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            return h.response({ message: "Invalid email or password" }).code(401);
        }
        // Generate JWT token
        const token = (0, auth_1.generateToken)(user);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return h
            .response({
            message: "Login successful",
            token,
            user: userWithoutPassword,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in login: ${error}`);
        return h
            .response({ message: "An error occurred while logging in" })
            .code(500);
    }
};
exports.login = login;
const getProfile = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;
        // Find user by ID
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return h
            .response({
            user: userWithoutPassword,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in getProfile: ${error}`);
        return h
            .response({
            message: "An error occurred while fetching the user profile",
        })
            .code(500);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;
        const { firstName, lastName, phoneNumber, address } = request.payload;
        // Find user by ID
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }
        // Update user fields
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phoneNumber)
            user.phoneNumber = phoneNumber;
        if (address)
            user.address = address;
        // Save updated user
        const updatedUser = await userRepository.save(user);
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        return h
            .response({
            message: "Profile updated successfully",
            user: userWithoutPassword,
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in updateProfile: ${error}`);
        return h
            .response({
            message: "An error occurred while updating the user profile",
        })
            .code(500);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;
        const { currentPassword, newPassword } = request.payload;
        // Validate input
        if (!currentPassword || !newPassword) {
            return h
                .response({ message: "Current password and new password are required" })
                .code(400);
        }
        if (!(0, auth_1.validatePassword)(newPassword)) {
            return h
                .response({
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
            })
                .code(400);
        }
        // Find user by ID
        const userRepository = database_1.AppDataSource.getRepository(models_1.User);
        const user = await userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }
        // Verify current password
        const isPasswordValid = await (0, auth_1.comparePassword)(currentPassword, user.password);
        if (!isPasswordValid) {
            return h.response({ message: "Current password is incorrect" }).code(401);
        }
        // Hash new password
        const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
        // Update password
        user.password = hashedPassword;
        await userRepository.save(user);
        return h
            .response({
            message: "Password changed successfully",
        })
            .code(200);
    }
    catch (error) {
        logger_1.default.error(`Error in changePassword: ${error}`);
        return h
            .response({ message: "An error occurred while changing the password" })
            .code(500);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map