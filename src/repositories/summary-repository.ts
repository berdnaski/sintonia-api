import { prisma } from "../database/prisma-client";
import { DailySummary } from "@prisma/client";
import { PaginationParams, Paginate } from "../@types/prisma";
import type { ICreateDailySummary, IDailySummaryRepository, IUpdateDailySummary } from "../interfaces/summary-interface";

export class PrismaSummaryRepository implements IDailySummaryRepository {
  async create(data: ICreateDailySummary): Promise<DailySummary> {
    return await prisma.dailySummary.create({ data });
  }

  async exists(ident: string): Promise<boolean> {
    const summary = await prisma.dailySummary.findFirst({
      where: {
        OR: [{ id: ident }, { coupleId: ident }]
      }
    });
    return !!summary;
  }

  async save(id: string, data: IUpdateDailySummary): Promise<DailySummary> {
    return await prisma.dailySummary.update({
      where: { id },
      data
    });
  }

  async remove(id: string): Promise<DailySummary> {
    return await prisma.dailySummary.delete({
      where: { id }
    });
  }

  async findOne(id: string): Promise<DailySummary | null> {
    return await prisma.dailySummary.findUnique({
      where: { id }
    });
  }

  async findByDate(coupleId: string, date: Date): Promise<DailySummary | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    return await prisma.dailySummary.findFirst({
      where: {
        coupleId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });
  }
  
  async findAll(coupleId: string, params: PaginationParams): Promise<Paginate<DailySummary>> {
    const { page = 1, perPage = 10 } = params;
    const skip = (page - 1) * perPage;
  
    const [dailySummaries, total] = await Promise.all([
      prisma.dailySummary.findMany({
        where: { coupleId },
        skip,
        take: perPage,
        orderBy: { date: "desc" }
      }),
      prisma.dailySummary.count({ where: { coupleId } })
    ]);
  
    return {
      data: dailySummaries,
      meta: {
        total,
        page,
        perPage,
        lastPage: Math.ceil(total / perPage)
      }
    };
  }  
}
