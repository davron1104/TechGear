-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('UZS', 'USD');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'UZS',
ADD COLUMN     "exchangeRate" DECIMAL(10,2) NOT NULL DEFAULT 12500;

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);
