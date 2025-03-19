-- CreateEnum
CREATE TYPE "CoupleMetricClassification" AS ENUM ('Synchrony', 'Connection', 'Communication', 'Intensity');

-- CreateEnum
CREATE TYPE "CoupleMetricLevel" AS ENUM ('VeryBad', 'Bad', 'SlightlyBad', 'Neutral', 'SlightlyGood', 'Good', 'VeryGood');

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

-- CreateTable
CREATE TABLE "couple_metric_records" (
    "id" TEXT NOT NULL,
    "coupleMetricId" TEXT NOT NULL,
    "classification" "CoupleMetricClassification" NOT NULL,
    "level" "CoupleMetricLevel" NOT NULL,
    "percentage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "couple_metric_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "couple_metrics" ADD CONSTRAINT "couple_metrics_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_metric_records" ADD CONSTRAINT "couple_metric_records_coupleMetricId_fkey" FOREIGN KEY ("coupleMetricId") REFERENCES "couple_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
