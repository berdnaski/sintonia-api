import { CoupleMetric } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { CreateCoupleMetric, ICoupleMetricRepository } from "../interfaces/couple-metric.interface";

export class PrismaCoupleMetricRepository implements ICoupleMetricRepository {
  async create(coupleMetric: CreateCoupleMetric): Promise<CoupleMetric> {
    const query = await prisma.coupleMetric.create({
      data: {
        ...coupleMetric,
        communication: coupleMetric.communication ?? 100,
        connection: coupleMetric.connection ?? 100,
        synchrony: coupleMetric.synchrony ?? 100,
        intensity: coupleMetric.intensity ?? 100,
      }
    });

    return query
  }

  async findByCoupleId(coupleId: string): Promise<CoupleMetric | null> {
    return await prisma.coupleMetric.findFirst({
      where: { coupleId },
    })
  }
}
