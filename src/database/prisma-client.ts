import { PrismaClient } from '@prisma/client';

// Instancia o Prisma Client globalmente para evitar múltiplas instâncias em desenvolvimento
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

// Para evitar que o Prisma crie novas instâncias em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
