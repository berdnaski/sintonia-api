import type { AIResponse, Prisma } from "@prisma/client";
import { Paginate, PaginationParams } from "../@types/prisma";

export interface ICreateIAResponse {
  coupleId: string;
  summary: string;
  advice: string;
  metrics: Prisma.JsonArray
  signalId?: string;
}

export interface GenerateAnalysisResponse {
  summary: string;
  advice: string;
};

export interface IAIResponseRepository {
  create(ai: ICreateIAResponse): Promise<AIResponse>
  findByCoupleId(coupleId: string, params: PaginationParams): Promise<Paginate<AIResponse>>;
  findAll(): Promise<AIResponse[]>
}
