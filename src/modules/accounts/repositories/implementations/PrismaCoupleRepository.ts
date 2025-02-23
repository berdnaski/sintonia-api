import { prisma } from "infra/prisma/prisma-client";
import { Couple } from "../../entities/Couple";
import { ICoupleRepository } from "../ICoupleRepository";

export class PrismaCoupleRepository implements ICoupleRepository {
  async create(userId: string): Promise<Couple> {
    const coupleData = await prisma.couple.create({
      data: {
        users: { connect: { id: userId } },
      },
      include: {
        users: true,
      },
    });

    return {
      ...coupleData,
    } as unknown as Couple;
  }

  async findById(id: string): Promise<Couple | null> {
    const query = await prisma.couple.findUnique({
      where: {
        id
      }
    })

    return {
      ...query,
      _id: query?.id,
    } as unknown as Couple;
  }
}