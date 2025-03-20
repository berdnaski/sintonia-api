import { CoupleMetric, CoupleMetricClassification, CoupleMetricLevel, CoupleMetricRecord, Prisma } from "@prisma/client";

export interface CreateCoupleMetricRecord {
  coupleMetricId: string
  classification: CoupleMetricClassification
  level: CoupleMetricLevel
  percentage: number
}

export interface ICoupleMetricRecordRepository {
  create(record: CreateCoupleMetricRecord): Promise<CoupleMetricRecord>
  createMany(record: CreateCoupleMetricRecord[]): Promise<void>
}
