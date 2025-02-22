import type { Couple } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import type { CoupleRepository } from "../interfaces/couple.interface";

class CoupleRepositoryPrisma implements CoupleRepository {
  async create(userId: string): Promise<Couple> {
    const couple = await prisma.couple.create({
      data: {
        users: { connect: { id: userId } },
      },
    });
  
    return couple;
  }

  async findById(id: string): Promise<Couple | null> {
    const result = await prisma.couple.findUnique({
      where: {
        id
      }
    })

    return result;
  }
}

export { CoupleRepositoryPrisma }
