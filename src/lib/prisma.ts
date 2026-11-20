import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton. In development, Next.js hot-reloads modules, which would
 * otherwise open a new connection pool on every reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
