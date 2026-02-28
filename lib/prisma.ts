// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // ช่วยให้เห็น SQL ที่รันใน Console ตอนพัฒนา
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
