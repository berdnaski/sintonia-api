import { ChallengeTypeAnswer } from "@prisma/client";
import { FastifyInstance, FastifyRequest, type FastifyReply } from "fastify";
import { validAnswers } from "../interfaces/challenge-interface";
import { ChallengeService } from "../services/challengeService/challenge-service";

export class ChallengeController {
  private challengeService: ChallengeService;

  constructor(app: FastifyInstance) {
    this.challengeService = new ChallengeService(app);
  }

  async save(req: FastifyRequest<{ Params: { id: string }; Body: { answer: ChallengeTypeAnswer } }>, reply: FastifyReply) {
    const { id } = req.params;
    const { answer } = req.body;

    if (!validAnswers.includes(answer)) {
      return reply.status(400).send({ error: "Invalid answer value." });
    }

    const updateResult = await this.challengeService.save(id, answer);
    if (updateResult.isLeft()) {
      return reply.status(400).send({ error: "Failed to update user." });
    }

    return reply.status(200).send(updateResult.value);
  }

  async findOne(req: FastifyRequest<{ Params: { ident: string } }>, reply: FastifyReply) {
    const { ident } = req.params;

    const challengeResult = await this.challengeService.findOne(ident);

    if (challengeResult.isLeft()) {
      const error = challengeResult.value;
      return reply.status(404).send({ message: error.message });
    } else {
      return reply.status(200).send(challengeResult.value);
    }
  }

  async findAll(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    const { userId } = req.params
    const challengeResult = await this.challengeService.getAllChallenges(userId);

    if (challengeResult.isLeft()) {
      const error = challengeResult.value;
      return reply.status(400).send({ message: error.message });
    } else {
      return reply.status(200).send(challengeResult.value);
    }
  }

  async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;

    const removeResult = await this.challengeService.remove(id);

    if (removeResult.isLeft()) {
      const error = removeResult.value;
      return reply.status(400).send({ message: error.message });
    } else {
      return reply.status(204).send();
    }
  }

  async generateChallenge(req: FastifyRequest<{ Body: { userId: string, coupleId: string } }>, reply: FastifyReply) {
    const ai = await this.challengeService.generateChallenge(req.body.userId, req.body.coupleId);

    return reply.send(ai)
  }
}
