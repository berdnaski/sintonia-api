import type { Memory } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import type { CreateMemory, IMemory, IMemoryRepository, MemoryUpdate } from "../interfaces/memory.interface";

export class PrismaMemoryRepository implements IMemoryRepository {
  async create(memory: CreateMemory): Promise<Memory> {
    const query = await prisma.memory.create({
      data: {
        title: memory.title,
        description: memory.description,
        avatarUrl: memory.avatar ?? null,
        coupleId: memory.coupleId,
        createdByUserId: memory.createdByUserId,
      },
    });
    return query;
  }

  async save(id: string, updatedData: MemoryUpdate): Promise<Memory> {
    const result = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        title: updatedData.title,
        description: updatedData.description,
        avatarUrl: updatedData.avatar ?? null, 
      }
    });

    return result;
  }

  async findOne(ident: string): Promise<Memory | null> {
    const query = await prisma.memory.findFirst({
      where: {
        OR: [{ id: ident }, { coupleId: ident }], 
      },
      include: {
        couple: true,  
        createdByUser: true, 
      },
    });

    return query;
  }

  async findAll(coupleId: string, limit: number, page: number): Promise<Memory[]> {
    const skip = (page - 1) * limit;
  
    const memories = await prisma.memory.findMany({
      where: {
        coupleId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
      include: {
        couple: true,
        createdByUser: true,
      },
    });
  
    return memories;
  }
  

  async exists(ident: string): Promise<boolean> {
    const query = await prisma.memory.findFirst({
      where: {
        OR: [{ id: ident }, { coupleId: ident }], 
      },
    });

    return !!query;
  }

  async remove(id: string): Promise<Memory> {
    const result = await prisma.memory.delete({
      where: { id },
    });

    return result;
  }
}
