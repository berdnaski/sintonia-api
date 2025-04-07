import type { AIResponse, Prisma, Signal } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { left, right, type Either } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { IAIResponseRepository } from "../../interfaces/ai-response.interface";
import type { ISignalRepository, ISignalUpdate } from "../../interfaces/signal.interface";
import { AnswerSignalMessage } from "../../providers/ai/functions/answerSignalMessage";
import { PrismaAIResponseRepository } from "../../repositories/ai-response-repository";
import { PrismaSignalRepository } from "../../repositories/signal-repository";
import { CoupleMetricService } from "../coupleMetricService/couple-metric-service";
import { CoupleMetricRecordService } from "../coupleMetricRecordService/couple-metric-record-service";
import { CreateCoupleMetricRecord } from "../../interfaces/couple-metric-record.interface";
import { Paginate, PaginationParams } from "../../@types/prisma";

type generateAnalysisResponse = Either<RequiredParametersError, AIResponse>
type getAnalysisHistoryResponse = Either<RequiredParametersError, Paginate<AIResponse>>
type saveSignalResponse = Either<RequiredParametersError, Signal>;
type getSignalByIdResponse = Either<RequiredParametersError, Signal>;
type getAllSignalResponse = Either<RequiredParametersError, Paginate<Signal>>;
type existsSignalResponse = Either<RequiredParametersError, boolean>;
type removeSignalResponse = Either<RequiredParametersError, Signal>;

export class SignalService {
  private signalRepository: ISignalRepository;
  private IAIResponseRepository: IAIResponseRepository
  private metricService: CoupleMetricService
  private metricRecordService: CoupleMetricRecordService

  constructor(fastify: FastifyInstance) {
    this.signalRepository = new PrismaSignalRepository();
    this.IAIResponseRepository = new PrismaAIResponseRepository();
    this.metricService = new CoupleMetricService(fastify)
    this.metricRecordService = new CoupleMetricRecordService(fastify)
  }

  async generateAnalysis(userId: string, coupleId: string, emotion: string, note: string): Promise<generateAnalysisResponse> {
    const message = `Emotion: ${emotion}, Note: ${note}`

    const [answer, signal] = await Promise.all([
      AnswerSignalMessage({ message, coupleId }),
      this.signalRepository.create({ userId, coupleId, emotion, note }),
    ]);

    const [iaResponse, metric] = await Promise.all([
      this.IAIResponseRepository.create({
        ...answer.response,
        signalId: signal.id,
        metrics: answer.response.metrics as Prisma.JsonArray
      }),
      this.metricService.findByCoupleId(coupleId),
    ]);

    if (metric.isLeft()) {
      return left(metric.value);
    }

    const metricsMapped = answer.response.metrics.map(item => ({
      ...item,
      coupleMetricId: metric.value.id
    }))

    await this.metricRecordService.createMany(metricsMapped as CreateCoupleMetricRecord[])

    this.metricService.calculateAvgMetrics(metric.value)

    return right(iaResponse);
  }


  async getAnalysisHistory(coupleId: string, params: PaginationParams): Promise<getAnalysisHistoryResponse> {
    const answer = await this.IAIResponseRepository.findByCoupleId(coupleId, params);

    return right(answer);
  }

  async save(id: string, updateData: ISignalUpdate): Promise<saveSignalResponse> {
    const signal = await this.signalRepository.findOne(id);

    if (!signal) {
      return left(new RequiredParametersError('Signal not found'));
    }

    const updatedSignal = await this.signalRepository.save(id, updateData);

    return right(updatedSignal);
  }

  async findOne(ident: string): Promise<getSignalByIdResponse> {
    const result = await this.signalRepository.findOne(ident);

    return right(result);
  }

  async findAllByCoupleId(coupleId: string, params: PaginationParams): Promise<getAllSignalResponse> {
    const signals = await this.signalRepository.findByCoupleId(coupleId, params);

    return right(signals);
  }

  async exists(ident: string): Promise<existsSignalResponse> {
    const result = await this.signalRepository.exists(ident);

    return right(result);
  }

  async remove(id: string): Promise<removeSignalResponse> {
    const signal = await this.signalRepository.findOne(id);

    if (!signal) {
      return left(new RequiredParametersError('Signal not found'));
    }

    const result = await this.signalRepository.remove(id);

    return right(result);
  }
}
