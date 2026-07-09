-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('new_claim', 'pickup_reminder', 'listing_archived', 'milestone', 'general');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'general',
    "title" VARCHAR(120) NOT NULL,
    "message" TEXT NOT NULL,
    "actionLabel" VARCHAR(80),
    "actionUrl" TEXT,
    "relatedClaimId" TEXT,
    "relatedListingId" TEXT,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_relatedClaimId_idx" ON "Notification"("relatedClaimId");

-- CreateIndex
CREATE INDEX "Notification_relatedListingId_idx" ON "Notification"("relatedListingId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
