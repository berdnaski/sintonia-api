import type { FastifyInstance } from "fastify";
import { Auth } from "../middlewares/auth";
import { CoupleController } from "../controllers/couple-controller";
import { CoupleService } from "../services/coupleService/couple-service";

export async function coupleRoutes(app: FastifyInstance) {
  const coupleController = new CoupleController(app);

  app.addHook("onRequest", Auth);

  app.post<{ Body: { email: string } }>('/couple/invite', async (req, reply) => {
    await coupleController.invitePartner(req, reply);
  });
}
