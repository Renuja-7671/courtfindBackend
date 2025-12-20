const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      role: 'Admin',
      firstName: 'Nimal',
      lastName: 'Bandara',
      email: 'nimaladmin@gmail.com',
      password: '$2b$10$Gogp.uT2FdiPHS2DP0guHuXLJE7A.4A1G2GgXGw4Dg2LfFvI.AKB2',
      mobile: '0775505869',
      country: 'Sri Lanka',
      province: 'Western',
      zip: '12410',
      address: '201, Katubedda, Moratuwa'
    }
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());