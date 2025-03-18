-- CreateEnum
CREATE TYPE "CoupleMetricClassification" AS ENUM ('Synchrony', 'Connection', 'Communication', 'Intensity');

-- CreateEnum
CREATE TYPE "CoupleMetricLevel" AS ENUM ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREME');

-- AlterTable
ALTER TABLE "ai_responses" ADD COLUMN     "classification" "CoupleMetricClassification",
ADD COLUMN     "level" "CoupleMetricLevel",
ADD COLUMN     "percentage" INTEGER;

-- CreateTable
CREATE TABLE "couple_metrics" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "synchrony" INTEGER NOT NULL,
    "connection" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "intensity" INTEGER NOT NULL,

    CONSTRAINT "couple_metrics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "couple_metrics" ADD CONSTRAINT "couple_metrics_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
