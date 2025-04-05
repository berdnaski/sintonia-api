import type { FastifyInstance } from "fastify";
import { MemoryController } from "../controllers/memory-controller";
import { Auth } from "../middlewares/auth";
import { CheckSubscription } from "../middlewares/checkSubscription";
import { CreateMemory } from "../interfaces/memory.interface";  // Importe a interface CreateMemory
import type { PaginationParams } from "../@types/prisma";

export async function memoryRoutes(app: FastifyInstance) {
  const memoryController = new MemoryController(app);

  app.addHook("onRequest", Auth);
  app.addHook("onRequest", CheckSubscription);

  app.post<{ Body: CreateMemory }>(
    '/memories',
    async (req, reply) => {
      await memoryController.create(req, reply);
    }
  );

  app.put<{ Params: { id: string }; Body: { title?: string; description?: string; avatar?: string | null } }>(
    '/memories/:id',
    async (req, reply) => {
      await memoryController.save(req, reply);
    }
  );

  app.get<{ Params: { coupleId: string }, Querystring: PaginationParams }>('/memories/:coupleId', async (req, reply) => {
    await memoryController.findAllByCouple(req, reply);
  });

  app.delete<{ Params: { id: string } }>('/memories/:id', async (req, reply) => {
    await memoryController.remove(req, reply);
  });
}
