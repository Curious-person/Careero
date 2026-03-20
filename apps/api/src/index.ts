import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { User, UserRole } from './models/User';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  const usersToSeed = [
    { email: 'jonathandionisiooo@gmail.com', role: UserRole.STUDENT },
    { email: 'kabgao@gmail.com', role: UserRole.COMPANY },
    { email: 'larksigmuondbabao@gmail.com', role: UserRole.SCHOOL }
  ];

  for (const u of usersToSeed) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const password = await bcrypt.hash('password123', 10);
      await User.create({ email: u.email, password, role: u.role, isVerified: true });
      console.log(`Seeded user: ${u.email} with password: password123`);
    }
  }
};

const startServer = async () => {
  await connectDB();
  await seedDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
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
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error) => {
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
