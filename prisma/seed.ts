import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@lab.local';
  const password = process.env.ADMIN_PASSWORD || 'changeme';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists. Skipping.`);
    return;
  }

  const count = await prisma.user.count();
  if (count > 0) {
    console.log('Users already exist. Not creating default admin.');
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, password: hash, name: 'Admin', role: 'admin' },
  });
  console.log(`Created admin user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
