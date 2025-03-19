import { CoupleMetricLevel } from "@prisma/client";

export const CoupleMetricLevelPercentage = {
  [CoupleMetricLevel.VeryBad]: { min: 70, max: 100, weight: -3 },
  [CoupleMetricLevel.Bad]: { min: 30, max: 70, weight: -2 },
  [CoupleMetricLevel.SlightlyBad]: { min: 0, max: 30, weight: -1 },
  [CoupleMetricLevel.Neutral]: { min: 0, max: 0, weight: 0 },
  [CoupleMetricLevel.SlightlyGood]: { min: 0, max: 30, weight: 1 },
  [CoupleMetricLevel.Good]: { min: 30, max: 70, weight: 2 },
  [CoupleMetricLevel.VeryGood]: { min: 70, max: 100, weight: 3 }
}
