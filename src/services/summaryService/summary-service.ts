import type { FastifyInstance } from "fastify";
import { GenerateDailySummary } from "../../providers/ai/functions/generateDailySummary";
import { PrismaSummaryRepository } from "../../repositories/summary-repository";
import { left, right, type Either } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import type { DailySummary } from "@prisma/client";
import type { IDailySummaryRepository } from "../../interfaces/summary-interface";
import type { Paginate, PaginationParams } from "../../@types/prisma";

type generateSummaryResponse = Either<RequiredParametersError, DailySummary>;
type getSummaryResponse = Either<RequiredParametersError, DailySummary | null>;
type removeSummaryResponse = Either<RequiredParametersError, DailySummary>;

export class SummaryService {
  private summaryRepository: IDailySummaryRepository;

  constructor(fastify: FastifyInstance) {
    this.summaryRepository = new PrismaSummaryRepository();
  }

  async generate(coupleId: string): Promise<generateSummaryResponse> {
    const { response } = await GenerateDailySummary({ coupleId });

    const existing = await this.summaryRepository.findByDate(coupleId, new Date());

    if (existing) {
      return left(new RequiredParametersError("Resumo diário já gerado hoje."));
    }

    const result = await this.summaryRepository.create({
      coupleId,
      date: new Date(),
      summary: response.summary,
      insights: response.insights
    });

    return right(result);
  }

  async findOne(id: string): Promise<getSummaryResponse> {
    const result = await this.summaryRepository.findOne(id);
    return right(result);
  }

  async findAll(coupleId: string, params: PaginationParams): Promise<Either<RequiredParametersError, Paginate<DailySummary>>> {
    const result = await this.summaryRepository.findAll(coupleId, params);
    return right(result);
  }

  async remove(id: string): Promise<removeSummaryResponse> {
    const existing = await this.summaryRepository.findOne(id);

    if (!existing) {
      return left(new RequiredParametersError("Resumo não encontrado."));
    }

    const result = await this.summaryRepository.remove(id);
    return right(result);
  }
}
