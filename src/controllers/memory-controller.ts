import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { MemoryService } from "../services/memoryService/memory-service";
import { CreateMemory } from "../interfaces/memory.interface";

export class MemoryController {
  private memoryService: MemoryService;

  constructor(app: FastifyInstance) {
    this.memoryService = new MemoryService();
  }

  async create(req: FastifyRequest<{ Body: CreateMemory }>, reply: FastifyReply) {
    const { title, description, avatar, coupleId, createdByUserId } = req.body;

    const result = await this.memoryService.create(
      title, 
      description, 
      avatar ?? "", 
      coupleId, 
      createdByUserId
    );

    if (result.isLeft()) {
      const error = result.value;
      return reply.status(400).send({ message: error.message });
    }

    reply.status(201).send(result.value);
  }

  async findOne(req: FastifyRequest<{ Params: { ident: string } }>, reply: FastifyReply) {
    const { ident } = req.params;

    const memoryResult = await this.memoryService.findOne(ident);

    if (memoryResult.isLeft()) {
      const error = memoryResult.value;
      return reply.status(400).send({ message: error.message });
    } else {
      reply.status(200).send(memoryResult.value);
    }
  }

  async findAllByCouple(req: FastifyRequest<{ Params: { coupleId: string } }>, reply: FastifyReply) {
    const { coupleId } = req.params;
    const memories = await this.memoryService.findAllByCouple(coupleId);

    if (memories.isLeft()) {
      const error = memories.value;
      return reply.status(400).send({ message: error.message });
    } else {
      reply.status(200).send(memories.value);
    }
  }

  async save(req: FastifyRequest<{ Params: { id: string }, Body: { title?: string, description?: string, avatar?: string } }>, reply: FastifyReply) {
    const { id } = req.params;
    const updatedData = req.body;
  
    if (updatedData && (updatedData.title || updatedData.description || updatedData.avatar)) {
      const updateResult = await this.memoryService.save(id, updatedData);
  
      if (updateResult.isLeft()) {
        const error = updateResult.value;
        return reply.status(400).send({ message: error.message });
      } else {
        reply.status(200).send(updateResult.value);
      }
    } else {
      return reply.status(400).send({ message: 'Invalid update data.' });
    }
  }
  
  async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;

    const removeMemory = await this.memoryService.remove(id);

    if (removeMemory.isLeft()) {
      const error = removeMemory.value;
      return reply.status(400).send({ message: error.message });
    } else {
      reply.status(204).send();
    }
  }
}
