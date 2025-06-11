import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SummaryService } from "../services/summaryService/summary-service";

export class SummaryController {
  private summaryService: SummaryService;

  constructor(app: FastifyInstance) {
    this.summaryService = new SummaryService(app);
  }

  async generate(req: FastifyRequest<{ Body: { coupleId: string } }>, reply: FastifyReply) {
    const { coupleId } = req.body;

    if (!coupleId) {
      return reply.status(400).send({ message: "Couple ID is required." });
    }

    const result = await this.summaryService.generate(coupleId);

    if (result.isLeft()) {
      const error = result.value;
      return reply.status(400).send({ message: error.message });
    }

    return reply.status(201).send(result.value);
  }

  async findAll(req: FastifyRequest<{ Params: { coupleId: string } }>, reply: FastifyReply) {
    const { coupleId } = req.params;
  
    const { page = "1", perPage = "10" } = req.query as { page?: string; perPage?: string };
  
    const parsedPage = Number(page);
    const parsedPerPage = Number(perPage);
  
    const result = await this.summaryService.findAll(coupleId, {
      page: isNaN(parsedPage) ? 1 : parsedPage,
      perPage: isNaN(parsedPerPage) ? 10 : parsedPerPage
    });
  
    if (result.isLeft()) {
      const error = result.value;
      return reply.status(404).send({ message: error.message });
    }
  
    return reply.status(200).send(result.value);
  }
  

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;

    const result = await this.summaryService.findOne(id);

    if (result.isLeft()) {
      const error = result.value;
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(200).send(result.value);
  }

  async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;

    const result = await this.summaryService.remove(id);

    if (result.isLeft()) {
      const error = result.value;
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(204).send();
  }
}
