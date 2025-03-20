import { AIResponse } from "@prisma/client";

export interface ICreateIAResponse {
  coupleId: string;
  summary: string;
  advice: string;
  signalId?: string;
}

export interface GenerateAnalysisResponse {
  summary: string;
  advice: string;
};

export interface IAIResponseRepository {
  create(ai: ICreateIAResponse): Promise<AIResponse>
  findByCoupleId(coupleId: string, limit: number): Promise<AIResponse[]>;
  findAll(): Promise<AIResponse[]>
}