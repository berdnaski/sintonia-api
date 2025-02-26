import { Couple } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { CoupleRepository } from "../interfaces/couple.interface";

export class PrismaCoupleRepository implements CoupleRepository {
  async create(couple: Couple): Promise<Couple> {
    const coupleData = await prisma.couple.create({
      data: {
        relationshipStatus: couple.relationshipStatus,
        user1Id: couple.user1Id,
        user2Id: couple.user2Id,
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    return coupleData as unknown as Couple;
  }

  async findById(id: string): Promise<Couple | null> {
    const query = await prisma.couple.findUnique({
      where: { id },
      include: { user1: true, user2: true },
    });

    if (!query) return null;

    return query as unknown as Couple;
  }
}