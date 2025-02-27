import type { FastifyInstance } from "fastify";
import { Auth } from "../middlewares/auth";
import { CoupleController } from "../controllers/couple-controller";
import { CoupleService } from "../services/coupleService/couple-service";
import { Param } from "@prisma/client/runtime/library";

export async function coupleRoutes(app: FastifyInstance) {
  const coupleController = new CoupleController(app);

  app.addHook("onRequest", Auth);

  app.post<{ Body: { email: string } }>('/couple/invite', async (req, reply) => {
    await coupleController.invitePartner(req, reply);
  });
  
  app.delete<{ Params: { inviteId: string } }>('/couple/invites/:inviteId', async (req, reply) => {
    await coupleController.cancelInvite(req, reply);
  });

  app.post<{ Params: { token: string }, Body: { inviteeId: string } }>('/couple/accept/:token', async (req, reply) => {
    await coupleController.acceptInvite(req, reply);
  });
}
