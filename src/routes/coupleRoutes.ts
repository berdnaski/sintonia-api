import type { FastifyInstance } from "fastify";
import { Auth } from "../middlewares/auth";
import { CoupleController } from "../controllers/couple-controller";
import { CoupleService } from "../services/coupleService/couple-service";
import { Param } from "@prisma/client/runtime/library";

export async function coupleRoutes(app: FastifyInstance) {
  const coupleController = new CoupleController(app);

  app.addHook("onRequest", Auth);

  app.post('/couple/invite', async (req, reply) => {
    await coupleController.invitePartner(req, reply);
  });
  
  app.delete('/couple/invites/:inviteId', async (req, reply) => {
    await coupleController.cancelInvite(req, reply);
  });
}
