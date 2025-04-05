import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { MemoryService } from "../services/memoryService/memory-service";
import { CreateMemory } from "../interfaces/memory.interface";
import type { StorageProvider } from "../providers/storage/storage-provider";
import { R2StorageProvider } from "../providers/storage/implementations/r2-storage-provider";

export class MemoryController {
  private memoryService: MemoryService;
  private storageProvider: StorageProvider;

  constructor(app: FastifyInstance) {
    this.memoryService = new MemoryService();
    this.storageProvider = new R2StorageProvider();
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      const fields = await req.parts();
      const formData: Record<string, any> = {};
      let file;
  
      for await (const part of fields) {
        if (part.type === 'file') {
          file = part;
        } else {
          formData[part.fieldname] = part.value;
        }
      }
  
      const { title, description, coupleId, createdByUserId } = formData;
  
      let avatarUrl = null;
      if (file) {
        try {
          const buffer = await file.toBuffer();
          const { key } = await this.storageProvider.upload({
            fileName: file.filename,
            fileType: file.mimetype,
            buffer,
          });
          avatarUrl = key;
        } catch (error) {
          return reply.status(400).send({ message: "Failed to upload memory image" });
        }
      }
  
      const result = await this.memoryService.create(
        title,
        description,
        coupleId,
        createdByUserId,
        avatarUrl
      );
  
      if (result.isLeft()) {
        const error = result.value;
        return reply.status(400).send({ message: error.message });
      }
  
      let memoryWithUrl = result.value;
      if (memoryWithUrl.avatarUrl) {
        const signedUrl = await this.storageProvider.getUrl(memoryWithUrl.avatarUrl);
        memoryWithUrl = { ...memoryWithUrl, avatarUrl: signedUrl };
      }
  
      reply.status(201).send(memoryWithUrl);
    } catch (error) {
      console.error('Error creating memory:', error);
      reply.status(500).send({ message: "Internal server error" });
    }
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

 async findAllByCouple(
  req: FastifyRequest<{ 
    Params: { coupleId: string }, 
    Querystring: { limit?: number; page?: number } 
  }>, 
  reply: FastifyReply
) {
  const { coupleId } = req.params;
  const limit = Number(req.query.limit) || 8;
  const page = Number(req.query.page) || 1;

  const memories = await this.memoryService.findAllByCouple(coupleId, limit, page);

  if (memories.isLeft()) {
    const error = memories.value;
    return reply.status(400).send({ message: error.message });
  }

  const memoriesWithUrls = await Promise.all(
    memories.value.map(async (memory) => {
      if (memory.avatarUrl) {
        const signedUrl = await this.storageProvider.getUrl(memory.avatarUrl);
        return { ...memory, avatarUrl: signedUrl };
      }
      return memory;
    })
  );

  reply.status(200).send(memoriesWithUrls);
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
