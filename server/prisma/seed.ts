import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { id: 'user-1', name: 'Alice Chen', email: 'alice@example.com' },
    { id: 'user-2', name: 'Bob Park', email: 'bob@example.com' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }

  console.log('Seed complete: 2 mock users created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
