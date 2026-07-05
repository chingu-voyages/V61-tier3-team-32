-- Add createdAt with a default for existing rows (backfill with now() if column doesn't exist)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add updatedAt: use DEFAULT first so existing rows get a value, then remove the default
-- (Prisma manages updatedAt itself at the application layer)
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
