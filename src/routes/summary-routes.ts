import type { FastifyInstance } from "fastify";
import { Auth } from "../middlewares/auth";
import { CheckSubscription } from "../middlewares/checkSubscription";
import { SummaryController } from "../controllers/summary-controller";

export async function summaryRoutes(app: FastifyInstance) {
  const summaryController = new SummaryController(app);

  app.addHook("onRequest", Auth);
  app.addHook("onRequest", CheckSubscription);

  app.post<{ Body: { coupleId: string } }>("/summary", async (req, reply) => {
    await summaryController.generate(req, reply);
  });

  app.get<{ Params: { id: string } }>("/summary/:id", async (req, reply) => {
    await summaryController.findOne(req, reply);
  });

  app.get<{ Params: { coupleId: string } }>("/summary/all/:coupleId", async (req, reply) => {
    await summaryController.findAll(req, reply);
  });

  app.delete<{ Params: { id: string } }>("/summary/:id", async (req, reply) => {
    await summaryController.remove(req, reply);
  });
}
