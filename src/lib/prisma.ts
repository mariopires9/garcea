import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL should point at Supabase's transaction pooler (port 6543): it
// only holds a database connection while a query runs, which suits
// serverless functions. Each server instance still opens at most this many
// connections (pg's default is 10), so a burst of parallel queries from one
// page can't take over the pooler's limited client slots.
const MAX_CONNECTIONS_PER_INSTANCE = 5;

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: MAX_CONNECTIONS_PER_INSTANCE,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
