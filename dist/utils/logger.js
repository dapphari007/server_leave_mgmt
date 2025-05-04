"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config/config"));
const { combine, timestamp, printf, colorize } = winston_1.default.format;
const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});
const logger = winston_1.default.createLogger({
    level: config_1.default.server.nodeEnv === 'development' ? 'debug' : 'info',
    format: combine(timestamp(), customFormat),
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp(), customFormat),
        }),
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
    ],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map