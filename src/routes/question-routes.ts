import type { FastifyInstance } from "fastify";
import { QuestionController } from "../controllers/question-controller";
import { IUpdateQuestion } from "../interfaces/question.interface";
import { Auth } from "../middlewares/auth";
import { CheckSubscription } from "../middlewares/checkSubscription";

export async function questionsRoutes(app: FastifyInstance) {
  const questionController = new QuestionController(app);

  app.addHook("onRequest", Auth);
  app.addHook("onRequest", CheckSubscription);

  app.put<{ Params: { id: string }, Body: IUpdateQuestion }>('/questions/answer/:id', async (req, reply) => {
    await questionController.save(req, reply);
  });

  app.get<{ Params: { ident: string } }>('/questions/:ident', async (req, reply) => {
    await questionController.findOne(req, reply);
  });

  app.get<{ Params: { userId: string } }>('/questions/all', async (req, reply) => {
    await questionController.findAll(req, reply);
  });
}