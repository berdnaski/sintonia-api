import { CoupleMetricRecord } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { CreateCoupleMetricRecord, ICoupleMetricRecordRepository } from "../interfaces/couple-metric-record.interface";

export class PrismaCoupleMetricRecordRepository implements ICoupleMetricRecordRepository {
  async create(record: CreateCoupleMetricRecord): Promise<CoupleMetricRecord> {
    const query = await prisma.coupleMetricRecord.create({
      data: {
        ...record,
      }
    });

    return query
  }

  async createMany(records: CreateCoupleMetricRecord[]): Promise<void> {
    await prisma.coupleMetricRecord.createMany({
      data: records
    });
  }
}
