import { FastifyInstance, FastifyRequest, type FastifyReply } from "fastify";
import { IUpdateQuestion } from "../interfaces/question.interface";
import { QuestionService } from "../services/questionService/question-service";
import { PaginationParams } from "../@types/prisma";

export class QuestionController {
  private questionService: QuestionService;

  constructor(app: FastifyInstance) {
    this.questionService = new QuestionService(app);
  }

  async save(req: FastifyRequest<{ Params: { id: string }; Body: IUpdateQuestion }>, reply: FastifyReply) {
    const { id } = req.params;
    const updatedData = req.body;

    const updateResult = await this.questionService.save(id, updatedData);
    if (updateResult.isLeft()) {
      return reply.status(400).send({ message: "Failed to update user." });
    }

    return reply.status(200).send(updateResult.value);
  }

  async findOne(req: FastifyRequest<{ Params: { ident: string } }>, reply: FastifyReply) {
    const { ident } = req.params;

    const questionResult = await this.questionService.findOne(ident);

    if (questionResult.isLeft()) {
      const error = questionResult.value;
      return reply.status(404).send({ message: error.message });
    } else {
      return reply.status(200).send(questionResult.value);
    }
  }

  async findAll(req: FastifyRequest<{ Params: { userId: string }, Querystring: PaginationParams }>, reply: FastifyReply) {
    const { userId } = req.params
    const { perPage, page } = req.query

    const questionResult = await this.questionService.getAllQuestions(userId, {
      perPage, page
    });

    if (questionResult.isLeft()) {
      const error = questionResult.value;
      return reply.status(400).send({ message: error.message });
    } else {
      return reply.status(200).send(questionResult.value);
    }
  }

  async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;

    const removeResult = await this.questionService.remove(id);

    if (removeResult.isLeft()) {
      const error = removeResult.value;
      return reply.status(400).send({ message: error.message });
    } else {
      return reply.status(204).send();
    }
  }

  async generateQuestion(req: FastifyRequest<{ Body: { userId: string, coupleId: string } }>, reply: FastifyReply) {
    const ai = await this.questionService.generateQuestion(req.body.userId, req.body.coupleId);

    return reply.send(ai)
  }
}
