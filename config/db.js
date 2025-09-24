const prisma = require('../prisma/client');

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to MySQL database with Prisma');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { prisma, testConnection };