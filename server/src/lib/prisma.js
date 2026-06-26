const { PrismaClient } = require('@prisma/client');

// Vercel serverless functions can be invoked many times in parallel. Without
// this global singleton pattern, each invocation creates a brand-new
// PrismaClient — and therefore a new DB connection — instantly exhausting
// Supabase's PgBouncer pool limits and causing 500 errors.
//
// By hanging the instance off `globalThis`, Node's module cache reuses the
// same client across hot-reloads in dev and across warm lambda invocations in
// production, keeping the connection count at 1 per serverless worker.

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;

