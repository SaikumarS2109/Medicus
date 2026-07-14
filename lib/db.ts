import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingletonSymbol = Symbol.for("prisma.client");
const globalForPrisma = globalThis as unknown as {
  [prismaClientSingletonSymbol]: PrismaClient;
};

const createPrismaClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ["error"],
  });
};

export const db = globalForPrisma[prismaClientSingletonSymbol] || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma[prismaClientSingletonSymbol] = db;
}
