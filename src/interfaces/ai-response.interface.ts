import { AIResponse } from "@prisma/client";

export interface ICreateIAResponse {
  coupleId: string;
  summary: string;
  advice: string;
  challenge?: string;
  signalId?: string;
}

export interface GenerateAnalysisResponse {
  summary: string;
  advice: string;
  challenge?: string;
};

export interface IAIResponseRepository {
  create(ai: ICreateIAResponse): Promise<AIResponse>
  findByCoupleId(coupleId: string): Promise<AIResponse[]>;
  findAll(): Promise<AIResponse[]>
}