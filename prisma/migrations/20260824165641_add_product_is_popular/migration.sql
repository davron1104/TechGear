-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isPopular_deletedAt_idx" ON "Product"("isPopular", "deletedAt");
