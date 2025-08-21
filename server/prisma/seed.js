import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const pw = '741852';
  const hash = await bcrypt.hash(pw, 10);
  const existing = await prisma.user.findUnique({ where: { email: 'admin' } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email: 'admin',
        password: hash,
        role: 'admin'
      }
    });
    console.log('Admin user created: admin / 741852');
  } else {
    console.log('Admin already exists');
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
