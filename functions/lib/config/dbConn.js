"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not defined in the environment variables.');
        }
        await mongoose_1.default.connect(databaseUrl, {
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
        });
        console.log('Database connected successfully!');
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
    }
};
exports.default = connectDB;
//# sourceMappingURL=dbConn.js.map