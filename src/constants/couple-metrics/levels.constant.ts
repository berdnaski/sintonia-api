import { CoupleMetricLevel } from "@prisma/client";

export const CoupleMetricLevelPercentage: Record<CoupleMetricLevel, { min: number; max: number }> = {
  [CoupleMetricLevel.VERY_LOW]: { min: 0, max: 20 },
  [CoupleMetricLevel.LOW]: { min: 0, max: 30 },
  [CoupleMetricLevel.MODERATE]: { min: 30, max: 50 },
  [CoupleMetricLevel.HIGH]: { min: 50, max: 80 },
  [CoupleMetricLevel.VERY_HIGH]: { min: 80, max: 90 },
  [CoupleMetricLevel.EXTREME]: { min: 90, max: 100 },
};
