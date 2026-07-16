-- AlterEnum
ALTER TYPE "ClaimStatus" ADD VALUE 'declined';

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "contactEmail" VARCHAR(255),
ADD COLUMN     "contactPhone" VARCHAR(20),
ADD COLUMN     "detailsSentAt" TIMESTAMP(3),
ADD COLUMN     "pickupAddress" TEXT;
