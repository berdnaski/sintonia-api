import { CoupleMetric } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { CreateCoupleMetric, ICoupleMetricRepository } from "../../interfaces/couple-metric.interface";
import { PrismaCoupleMetricRepository } from "../../repositories/couple-metric-repository";
import { CoupleMetricRecordService } from "../coupleMetricRecordService/couple-metric-record-service";

type CreateCoupleMetricResponse = Either<RequiredParametersError, CoupleMetric>;
type FindByCoupleIdResponse = Either<RequiredParametersError, CoupleMetric>;

interface MetricRecord {
  classification: string;
  percentage: number;
}

interface CalculateAverageMetric {
  synchrony: number;
  connection: number;
  communication: number;
  intensity: number;
}

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

  }
}
