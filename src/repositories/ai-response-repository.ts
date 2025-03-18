import { AIResponse } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { IAIResponseRepository, ICreateIAResponse } from "../interfaces/ai-response.interface";

export class PrismaAIResponseRepository implements IAIResponseRepository {
  async create(data: ICreateIAResponse): Promise<AIResponse> {
    return prisma.aIResponse.create({
      data: {
        coupleId: data.coupleId,
        summary: data.summary,
        advice: data.advice,
        challenge: data.challenge,
        signalId: data.signalId, 
      },
    });
  }
  

  async findByCoupleId(coupleId: string): Promise<AIResponse[]> {
    return prisma.aIResponse.findMany({
      where: { coupleId },
      orderBy: { createdAt: "desc" },
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