import type { FastifyInstance } from "fastify";
import { CoupleInviteController } from "../controllers/couple-invite-controller";

export async function coupleInviteRoutes(app: FastifyInstance) {
  const coupleInviteController = new CoupleInviteController(app);

  app.get<{ Params: { token: string } }>('/couples/invite/token/:token', async (req, reply) => {
    await coupleInviteController.findByToken(req, reply);
  })
}
