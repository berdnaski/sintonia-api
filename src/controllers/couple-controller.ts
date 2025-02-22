import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CoupleService } from "../services/coupleService/couple-service";

export class CoupleController {
  private coupleService: CoupleService;

  constructor(app: FastifyInstance) {
    this.coupleService = new CoupleService(app);
  }

  async create(req: FastifyRequest<{ Body: { userId: string } }>, reply: FastifyReply) {
    const { userId } = req.body;

    const couple = await this.coupleService.create(userId);

    return reply.status(201).send({ couple });
  }
}

