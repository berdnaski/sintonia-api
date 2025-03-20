import { CoupleMetric } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { CreateCoupleMetric, ICoupleMetricRepository, UpdateCoupleMetric } from "../interfaces/couple-metric.interface";

export class PrismaCoupleMetricRepository implements ICoupleMetricRepository {
  async create(coupleMetric: CreateCoupleMetric): Promise<CoupleMetric> {
    const query = await prisma.coupleMetric.create({
      data: {
        ...coupleMetric,
        communication: coupleMetric.communication ?? 0,
        connection: coupleMetric.connection ?? 0,
        synchrony: coupleMetric.synchrony ?? 0,
        intensity: coupleMetric.intensity ?? 0,
      }
    });

    return query
  }

  async findByCoupleId(coupleId: string): Promise<CoupleMetric | null> {
    return await prisma.coupleMetric.findFirst({
      where: { coupleId },
    })
  }

  async update(id: string, data: UpdateCoupleMetric): Promise<CoupleMetric> {
    const result = await prisma.coupleMetric.update({
      where: {
        id,
      },
      data
    })

    return result;
  }
}
