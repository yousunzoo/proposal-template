import { PrismaClient } from '@prisma/client';

/**
 * 서버리스(Vercel)에서 요청마다 새 PrismaClient가 생성되어 커넥션이 고갈되지 않도록
 * 전역에 캐시한다. 프로덕션 풀링은 Neon pooled URL(DATABASE_URL)이 담당.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
