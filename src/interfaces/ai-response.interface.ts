import { AIResponse, CoupleMetricClassification, CoupleMetricLevel } from "@prisma/client";

export interface ICreateIAResponse {
  coupleId: string;
  summary: string;
  advice: string;
  challenge?: string;
  level: CoupleMetricLevel | null;
  classification: CoupleMetricClassification | null,
  percentage: string | number | null
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
