/**
 * Seed: cria super_admin inicial a partir de variáveis de ambiente.
 * Não cria duplicata se já existir.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name: 'Super Administrador',
      email,
      passwordHash,
      role: 'super_admin',
    },
  });
}

main()
  .catch((_err) => {
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
