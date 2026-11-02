-- DropIndex
DROP INDEX "attractions_destinationId_idx";

-- AlterTable
ALTER TABLE "attractions" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "attractions_destinationId_sortOrder_idx" ON "attractions"("destinationId", "sortOrder");
