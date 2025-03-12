import type { FastifyInstance } from "fastify";
import { Auth } from "../middlewares/auth";
import { CoupleController } from "../controllers/couple-controller";
import { CoupleService } from "../services/coupleService/couple-service";
import { Param } from "@prisma/client/runtime/library";
import { CheckSubscription } from "../middlewares/checkSubscription";

export async function coupleRoutes(app: FastifyInstance) {
  const coupleController = new CoupleController(app);

  app.addHook("onRequest", Auth);
  app.addHook("onRequest", CheckSubscription);

  app.post<{ Body: { email: string } }>('/couple/invite', async (req, reply) => {
    await coupleController.invitePartner(req, reply);
  });
  
  app.delete<{ Params: { inviteId: string } }>('/couple/invites/:inviteId', async (req, reply) => {
    await coupleController.cancelInvite(req, reply);
  });

  app.post<{ Params: { token: string } }>('/couple/accept/:token', async (req, reply) => {
    await coupleController.acceptInvite(req, reply);
  });

  app.get('/couples', async (req, reply) => {
    await coupleController.findAll(req, reply);
  })

  app.get<{ Params: { id: string } }>('/couples/:id', async (req, reply) => {
    await coupleController.findOne(req, reply);
  })

  app.delete<{ Params: { id: string } }>('/couples/:id', async (req, reply) => {
    await coupleController.delete(req, reply);
  })
}
