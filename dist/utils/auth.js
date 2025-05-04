"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.findUserByEmail = exports.validatePassword = exports.validateEmail = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const models_1 = require("../models");
const config_1 = __importDefault(require("../config/config"));
const database_1 = require("../config/database");
const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return bcrypt_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateToken = (user) => {
    const { id, email, role, level } = user;
    const token = require("@hapi/jwt").token.generate({
        aud: "leave-management-app",
        iss: "leave-management-api",
        id,
        email,
        role,
        level,
    }, {
        key: config_1.default.jwt.secret,
        algorithm: "HS256",
    }, {
        ttlSec: 14 * 24 * 60 * 60, // 14 days
    });
    return token;
};
exports.generateToken = generateToken;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
const findUserByEmail = async (email) => {
    const userRepository = database_1.AppDataSource.getRepository(models_1.User);
    return userRepository.findOne({ where: { email } });
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    const userRepository = database_1.AppDataSource.getRepository(models_1.User);
    return userRepository.findOne({ where: { id } });
};
exports.findUserById = findUserById;
//# sourceMappingURL=auth.js.map