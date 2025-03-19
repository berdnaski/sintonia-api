import { CoupleMetric } from "@prisma/client";

export interface CreateCoupleMetric {
  coupleId: string
  synchrony?: number
  connection?: number
  communication?: number
  intensity?: number
}

export interface UpdateCoupleMetric {
  synchrony?: number
  connection?: number
  communication?: number
  intensity?: number
}

export interface ICoupleMetricRepository {
  create(coupleMetric: CreateCoupleMetric): Promise<CoupleMetric>
  findByCoupleId(coupleId: string): Promise<CoupleMetric | null>
  update(id: string, data: UpdateCoupleMetric): Promise<CoupleMetric>
}
