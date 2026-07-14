import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingletonSymbol = Symbol.for("prisma.client");
const globalForPrisma = globalThis as unknown as {
  [prismaClientSingletonSymbol]: PrismaClient;
};

export const db = globalForPrisma[prismaClientSingletonSymbol] || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma[prismaClientSingletonSymbol] = db;
}
