import { CoupleMetricClassification, CoupleMetricRecord, Prisma } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { CreateCoupleMetricRecord, ICoupleMetricRecordRepository } from "../interfaces/couple-metric-record.interface";

type GroupByClassification = {
  classification: string;
  _avg: {
    percentage: number | null;
  };
}

export class PrismaCoupleMetricRecordRepository implements ICoupleMetricRecordRepository {
  async create(record: CreateCoupleMetricRecord): Promise<CoupleMetricRecord> {
    const query = await prisma.coupleMetricRecord.create({
      data: {
        ...record,
      }
    });

    return query
  }
}
