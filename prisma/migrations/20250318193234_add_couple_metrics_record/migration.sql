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
ALTER TABLE "couple_metric_records" ADD CONSTRAINT "couple_metric_records_coupleMetricId_fkey" FOREIGN KEY ("coupleMetricId") REFERENCES "couple_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
