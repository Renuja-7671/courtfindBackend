const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'pretty',
});

// Handle cleanup
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;