"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const User_1 = require("./models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seedDatabase = async () => {
    const usersToSeed = [
        { email: 'jonathandionisiooo@gmail.com', role: User_1.UserRole.STUDENT },
        { email: 'kabgao@gmail.com', role: User_1.UserRole.COMPANY },
        { email: 'larksigmuondbabao@gmail.com', role: User_1.UserRole.SCHOOL }
    ];
    for (const u of usersToSeed) {
        const exists = await User_1.User.findOne({ email: u.email });
        if (!exists) {
            const password = await bcryptjs_1.default.hash('password123', 10);
            await User_1.User.create({ email: u.email, password, role: u.role, isVerified: true });
            console.log(`Seeded user: ${u.email} with password: password123`);
        }
    }
};
const startServer = async () => {
    await (0, db_1.connectDB)();
    await seedDatabase();
    const server = app_1.default.listen(env_1.env.PORT, () => {
        console.log(`Server listening on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
    });
    return server;
};
const serverPromise = startServer();
const exitHandler = async () => {
    const server = await serverPromise;
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
};
const unexpectedErrorHandler = (error) => {
    console.error('Unexpected Error:', error);
    exitHandler();
};
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', async () => {
    console.log('SIGTERM received');
    const server = await serverPromise;
    if (server) {
        server.close();
    }
});
