import { AIResponse, Prisma } from "@prisma/client";

export interface ICreateIAResponse {
  coupleId: string;
  summary: string;
  advice: string;
  challenge?: string;
  metrics: Prisma.JsonArray
  signalId?: string;
}

export interface GenerateAnalysisResponse {
  summary: string;
  advice: string;
  challenge?: string;
};

export interface IAIResponseRepository {
  create(ai: ICreateIAResponse): Promise<AIResponse>
  findByCoupleId(coupleId: string, limit: number): Promise<AIResponse[]>;
  findAll(): Promise<AIResponse[]>
}
