import type { DailySummary } from "@prisma/client";
import type { Paginate, PaginationParams } from "../@types/prisma";

export interface IDailySummary {
  id: string;
  coupleId: string;
  date: Date;
  summary: string;
  insights?: string;
  createdAt: Date;
}

export interface ICreateDailySummary {
  coupleId: string;
  date: Date;
  summary: string;
  insights?: string;
}

export interface IUpdateDailySummary {
  summary?: string;
  insights?: string;
}

export interface IDailySummariesResponse {
  dailySummaries: IDailySummary[];
}

export interface IDailySummaryRepository {
  create(data: ICreateDailySummary): Promise<DailySummary>;
  save(id: string, data: IUpdateDailySummary): Promise<DailySummary>;
  findOne(id: string): Promise<DailySummary | null>;
  findByDate(coupleId: string, date: Date): Promise<DailySummary | null>;
  findAll(coupleId: string, params: PaginationParams): Promise<Paginate<DailySummary>>;
  remove(id: string): Promise<DailySummary>;
}
