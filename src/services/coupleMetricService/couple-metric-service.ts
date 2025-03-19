import { CoupleMetric, CoupleMetricClassification } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { CreateCoupleMetric, ICoupleMetricRepository } from "../../interfaces/couple-metric.interface";
import { PrismaCoupleMetricRepository } from "../../repositories/couple-metric-repository";
import { CoupleMetricRecordService } from "../coupleMetricRecordService/couple-metric-record-service";
import { CoupleMetricLevelPercentage } from "../../constants/couple-metrics/levels.constant";

type CreateCoupleMetricResponse = Either<RequiredParametersError, CoupleMetric>;
type FindByCoupleIdResponse = Either<RequiredParametersError, CoupleMetric>;

export class CoupleMetricService {
  private coupleMetricRepository: ICoupleMetricRepository;
  private recordService: CoupleMetricRecordService;

  constructor(fastify: FastifyInstance) {
    this.coupleMetricRepository = new PrismaCoupleMetricRepository();
    this.recordService = new CoupleMetricRecordService(fastify)
  }

  async create(data: CreateCoupleMetric): Promise<CreateCoupleMetricResponse> {
    const metricAlreadyExists = await this.coupleMetricRepository.findByCoupleId(data.coupleId)

    if (metricAlreadyExists) {
      return left(new RequiredParametersError("This couple already has a registered metric."))
    }

    const metric = await this.coupleMetricRepository.create(data)

    return right(metric)
  }

  async findByCoupleId(coupleId: string): Promise<FindByCoupleIdResponse> {
    const couple = await this.coupleMetricRepository.findByCoupleId(coupleId)

    if (!couple) {
      return left(new RequiredParametersError("Couple metric not found."))
    }

    return right(couple)
  }

  async calculateAverageMetrics(metric: CoupleMetric) {
    const records = await this.recordService.avgByClassification(metric.id)

    const medias = records.reduce(
      (acc, record) => {
        const weight = CoupleMetricLevelPercentage[record.level].weight
        const percentage = record._avg.percentage * weight

        acc[record.classification].percentage += percentage
        acc[record.classification].weight += Math.abs(weight)

        return acc;
      },
      {
        [CoupleMetricClassification.Synchrony]: {
          percentage: 0,
          weight: 0
        },
        [CoupleMetricClassification.Connection]: {
          percentage: 0,
          weight: 0
        },
        [CoupleMetricClassification.Communication]: {
          percentage: 0,
          weight: 0
        },
        [CoupleMetricClassification.Intensity]: {
          percentage: 0,
          weight: 0
        },
      }
    );

    const synchrony = medias[CoupleMetricClassification.Synchrony]
    const connection = medias[CoupleMetricClassification.Connection]
    const communication = medias[CoupleMetricClassification.Communication]
    const intensity = medias[CoupleMetricClassification.Intensity]

    const clamp = (value: number) => Math.max(-100, Math.min(100, value));

    this.coupleMetricRepository.update(metric.id, {
      synchrony: clamp(synchrony.weight ? synchrony.percentage / synchrony.weight : metric.synchrony),
      connection: clamp(connection.weight ? connection.percentage / connection.weight : metric.connection),
      communication: clamp(communication.weight ? communication.percentage / communication.weight : metric.communication),
      intensity: clamp(intensity.weight ? intensity.percentage / intensity.weight : metric.intensity)
    })
  }
}
