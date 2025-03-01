import type { AIResponse, Signal } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { left, right, type Either } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { IAIResponseRepository } from "../../interfaces/ai-response.interface";
import type { ISignalRepository, ISignalUpdate } from "../../interfaces/signal.interface";
import { AnswerSignalMessage } from "../../providers/ai/functions/answerSignalMessage";
import { PrismaAIResponseRepository } from "../../repositories/ai-response-repository";
import { PrismaSignalRepository } from "../../repositories/signal-repository";

type generateAnalysisResponse = Either<RequiredParametersError, AIResponse>
type getAnalysisHistoryResponse = Either<RequiredParametersError, AIResponse[]>
type saveSignalResponse = Either<RequiredParametersError, Signal>;
type getSignalByIdResponse = Either<RequiredParametersError, Signal>;
type getAllSignalResponse = Either<RequiredParametersError, Signal[]>;
type existsSignalResponse = Either<RequiredParametersError, boolean>;
type removeSignalResponse = Either<RequiredParametersError, Signal>;

export class SignalService {
  private signalRepository: ISignalRepository;
  private IAIResponseRepository: IAIResponseRepository

  constructor(fastify: FastifyInstance) {
    this.signalRepository = new PrismaSignalRepository();
    this.IAIResponseRepository = new PrismaAIResponseRepository()
  }

  async generateAnalysis(userId: string, coupleId: string, emotion: string, note: string): Promise<generateAnalysisResponse> {    
    await this.signalRepository.create({ userId, coupleId, emotion, note })
    
    const message = `Emotion: ${emotion}, Note: ${note}`
    const answer = await AnswerSignalMessage({ message, coupleId })

    const result = await this.IAIResponseRepository.create({
      ...answer.response,
      coupleId
    })

    return right(result);
  }

  async getAnalysisHistory(coupleId: string): Promise<getAnalysisHistoryResponse> {
    const answer = await this.IAIResponseRepository.findByCoupleId(coupleId)
    return right(answer)
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

  async findAll(): Promise<getAllSignalResponse> {
    const signals = await this.signalRepository.findAll();

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
