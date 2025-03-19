import { CoupleMetricRecord } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { CreateCoupleMetricRecord, ICoupleMetricRecordRepository } from "../../interfaces/couple-metric-record.interface";
import { PrismaCoupleMetricRecordRepository } from "../../repositories/couple-metric-record-repository";
import { prisma } from "../../database/prisma-client";

export class CoupleMetricRecordService {
  private repository: ICoupleMetricRecordRepository;

  constructor(fastify: FastifyInstance) {
    this.repository = new PrismaCoupleMetricRecordRepository();
  }

  async create(data: CreateCoupleMetricRecord): Promise<CoupleMetricRecord> {
    return this.repository.create(data)
  }

  async createMany(data: CreateCoupleMetricRecord[]): Promise<void> {
    return this.repository.createMany(data)
  }

  /**
   * TODO: Move to repository
   */
  async avgByClassification(coupleMetricId: string) {
    return prisma.coupleMetricRecord.groupBy({
      by: ["classification", "level"],
      where: { coupleMetricId },
      _avg: {
        percentage: true,
      },
    });
  }


}
