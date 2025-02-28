import type { Signal } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import type { ICreateSignal, ISignal, ISignalRepository, ISignalUpdate } from "../interfaces/signal.interface";

export class PrismaSignalRepository implements ISignalRepository {
  async create(signal: Signal): Promise<Signal> {
    const query = await prisma.signal.create({
      data: {
        id: signal.id,
        userId: signal.userId,
        coupleId: signal.coupleId,
        emotion: signal.emotion,
        note: signal.note ?? null,
      },
      include: {
        user: true,
        couple: true,
      },
    });

    return query;
  }

  async save(id: string, updateData: ISignalUpdate): Promise<Signal> {
    const result = await prisma.signal.update({
      where: {
        id,
      },
      data: {
        emotion: updateData.emotion,
        note: updateData.note,
      }
    });

    return result;
  }

  async findOne(ident: string): Promise<Signal> {
    const query = await prisma.signal.findFirst({
      where: {
        OR: [{ id: ident }, { userId: ident }, { coupleId: ident }],
      },
      include: {
        user: true,
        couple: true,
      },
    });

    return query as Signal;
  }

  async findAll(): Promise<Signal[]> {
    const query = await prisma.signal.findMany();

    return query.map((signal) => {
      return {
        id: signal.id,
        userId: signal.userId,
        coupleId: signal.coupleId,
        emotion: signal.emotion,
        note: signal.note,
      }
    }) as unknown as Signal[]
}

  async exists(ident: string): Promise<boolean> {
    const query = await prisma.signal.findFirst({
      where: {
        OR: [{ id: ident }, { userId: ident }, { coupleId: ident }],
      },
    });

    return !!query;
  }

  async remove(id: string): Promise<Signal> {
    const result = await prisma.signal.delete({
      where: { id },
    })

    return result;
  }

}