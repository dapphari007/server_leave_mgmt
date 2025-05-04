"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const config = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || 'localhost',
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'leave_management',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
        expiration: process.env.JWT_EXPIRATION || '1d',
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        user: process.env.EMAIL_USER || 'your_email@example.com',
        pass: process.env.EMAIL_PASS || 'your_email_password',
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
    },
};
exports.default = config;
//# sourceMappingURL=config.js.map