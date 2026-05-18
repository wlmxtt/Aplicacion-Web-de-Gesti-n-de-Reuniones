import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const schools = [
  'Escuela de Ingeniería',
  'Escuela de FACES (Administración y Contaduría)',
  'Escuela de Derecho',
  'Escuela de Psicología',
];

async function main() {
  console.log('Seeding schools...');
  for (const name of schools) {
    await prisma.school.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeding default user...');
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@ugma.edu.ve' },
    update: {
      firstName: 'Soporte',
      lastName: 'Técnico UGMA',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Soporte',
      lastName: 'Técnico UGMA',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'rector.herrera@ugma.edu.ve' },
    update: {},
    create: {
      email: 'rector.herrera@ugma.edu.ve',
      password: hashedPassword,
      firstName: 'Dr. Sebastian',
      lastName: 'Herrera',
      role: 'DIRECTOR_UGMA',
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

