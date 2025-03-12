import type { FastifyInstance } from "fastify";
import { SignalController } from "../controllers/signal-controller";
import { Auth } from "../middlewares/auth";
import { CheckSubscription } from "../middlewares/checkSubscription";

export async function signalRoutes(app: FastifyInstance) {
  const signalController = new SignalController(app);

  app.addHook("onRequest", Auth);
  app.addHook("onRequest", CheckSubscription);

  app.post<{ Body: { userId: string; coupleId: string; emotion: string; note: string | null } }>('/signals', async (req, reply) => {
    await signalController.create(req, reply);
  });

  app.put<{ Params: { id: string }; Body: { emotion: string; note: string | null } }>('/signals/:id', async (req, reply) => {
    await signalController.save(req, reply);
  });

  app.get<{ Params: { ident: string } }>('/signals/:ident', async (req, reply) => {
    await signalController.findOne(req, reply);
  });

  app.get('/signals', async (req, reply) => {
    await signalController.findAll(req, reply);
  });

  app.delete<{ Params: { id: string } }>('/signals/:id', async (req, reply) => {
    await signalController.remove(req, reply);
  });
}