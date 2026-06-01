import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Seeded admin user: ${admin.email}`);

  // 2. Seed Owner User
  const owner = await prisma.user.upsert({
    where: { email: 'owner@test.com' },
    update: {},
    create: {
      name: 'Owner User',
      email: 'owner@test.com',
      password: passwordHash,
      role: Role.OWNER,
    },
  });
  console.log(`Seeded owner user: ${owner.email}`);

  // 3. Seed Regular User
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@test.com',
      password: passwordHash,
      role: Role.USER,
    },
  });
  console.log(`Seeded regular user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
