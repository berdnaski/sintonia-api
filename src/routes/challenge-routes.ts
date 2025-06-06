import { ChallengeTypeAnswer } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { ChallengeController } from "../controllers/challenge-controller";
import { Auth } from "../middlewares/auth";
import { CheckSubscription } from "../middlewares/checkSubscription";
import { ChallengeService } from "../services/challengeService/challenge-service";
import { QuestionService } from "../services/questionService/question-service";

export async function challengeRoutes(app: FastifyInstance) {
  const challengeController = new ChallengeController(app);

  app.addHook("onRequest", Auth);
  app.addHook("onRequest", CheckSubscription);

  app.put<{ Params: { id: string }, Body: { answer: ChallengeTypeAnswer } }>('/challenge/answer/:id', async (req, reply) => {
    await challengeController.save(req, reply);
  });

  app.get<{ Params: { ident: string } }>('/challenge/:ident', async (req, reply) => {
    await challengeController.findOne(req, reply);
  });

  app.get<{ Params: { userId: string } }>('/challenge/all/:userId', async (req, reply) => {
    await challengeController.findAll(req, reply);
  });

  app.post<{ Body: { userId: string, coupleId: string } }>('/challenge', async (req, reply) => {
    await challengeController.generateChallenge(req, reply);
  });
}
