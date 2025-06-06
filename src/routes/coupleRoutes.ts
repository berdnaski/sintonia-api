import type { FastifyInstance } from "fastify";
import { Auth } from "../middlewares/auth";
import { CoupleController } from "../controllers/couple-controller";
import { CheckSubscription } from "../middlewares/checkSubscription";
import { Couple } from "@prisma/client";
import { UpdateCopule } from "../interfaces/couple.interface";

export async function coupleRoutes(app: FastifyInstance) {
  const coupleController = new CoupleController(app);

  app.addHook("onRequest", Auth);

  app.register(async (app) => {
    app.addHook("onRequest", CheckSubscription);

    app.post<{ Body: { email: string } }>('/couples/invite', async (req, reply) => {
      await coupleController.invitePartner(req, reply);
    });

    app.delete<{ Params: { inviteId: string } }>('/couples/invite/:inviteId', async (req, reply) => {
      await coupleController.cancelInvite(req, reply);
    });

    app.get('/couples', async (req, reply) => {
      await coupleController.findAll(req, reply);
    });

    app.get<{ Params: { id: string } }>('/couples/:id', async (req, reply) => {
      await coupleController.findOne(req, reply);
    });

    app.delete<{ Params: { id: string } }>('/couples/:id', async (req, reply) => {
      await coupleController.delete(req, reply);
    });

    app.put<{ Params: { id: string }, Body: UpdateCopule }>('/couples/by-user', async (req, reply) => {
      await coupleController.updateByUser(req, reply);
    });

    app.get<{ Params: { userId: string } }>('/couples/by-user/:userId', async (req, reply) => {
      await coupleController.findByUserId(req, reply);
    });

    app.get<{ Params: { coupleId: string } }>('/couples/:coupleId/metrics', async (req, reply) => {
      await coupleController.metrics(req, reply);
    });
  });

  app.post<{ Params: { token: string } }>('/couples/invite/accept/:token', async (req, reply) => {
    await coupleController.acceptInvite(req, reply);
  });
}
