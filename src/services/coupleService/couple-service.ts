import type { FastifyInstance } from "fastify";
import type { CoupleRepository, CreateCouple } from "../../interfaces/couple.interface";
import { CoupleRepositoryPrisma } from "../../repositories/couple-repository";
import type { Couple } from "@prisma/client";
import { AppError } from "../../errors/app-error";

class CoupleService {
  private fastify: FastifyInstance;
  private coupleRepository: CoupleRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.coupleRepository = new CoupleRepositoryPrisma();
  }

  async create(userId: string): Promise<Couple> {
    const verifyIfExists = await this.coupleRepository.findById(userId);

    if (verifyIfExists) {
      throw new AppError('O casal já existe', 400);
    }

    const couple = await this.coupleRepository.create(userId);

    return couple;
  }
}

export { CoupleService }