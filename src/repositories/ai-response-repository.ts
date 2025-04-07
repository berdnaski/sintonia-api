import { prisma } from "../database/prisma-client";
import { IAIResponseRepository, ICreateIAResponse } from "../interfaces/ai-response.interface";
import { Paginate, PaginationParams } from "../@types/prisma";
import type { AIResponse } from "@prisma/client";

export class PrismaAIResponseRepository implements IAIResponseRepository {
  async create(data: ICreateIAResponse): Promise<AIResponse> {
    return prisma.aIResponse.create({
      data,
    });
  }


  async findByCoupleId(coupleId: string, params: PaginationParams): Promise<Paginate<AIResponse>> {
    return prisma.aIResponse.paginate<AIResponse>({
      where: { coupleId },
      orderBy: { createdAt: "desc" },
      ...params,
    });
  }

  async findAll(): Promise<AIResponse[]> {
    const query = await prisma.aIResponse.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return query.map((ai) => {
      return {
        id: ai.id,
        coupleId: ai.coupleId,
        summary: ai.summary,
        advice: ai.advice,
        createdAt: ai.createdAt
      }
    }) as unknown as AIResponse[];
  }
}
