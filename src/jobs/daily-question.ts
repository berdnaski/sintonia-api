import { FastifyInstance } from "fastify";
import cron from 'node-cron';
import { sintoniaConfig } from '../config/api';
import { ICoupleRepository } from "../interfaces/couple.interface";
import { PrismaCoupleRepository } from "../repositories/couple-repository";
import { QuestionService } from "../services/questionService/question-service";

export class JobDailyQuestion {
  private fastify: FastifyInstance;
  private coupleRepository: ICoupleRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.coupleRepository = new PrismaCoupleRepository();
  }

  public start() {
    const job = cron.schedule(sintoniaConfig.jobs.daily_questions, async () => {
      const couples = await this.coupleRepository.findAll();

      for (const couple of couples) {
        const userId1 = couple.user1Id;
        const userId2 = couple.user2Id;

        await new QuestionService(this.fastify).generateQuestion(userId1, couple.id);
        await new QuestionService(this.fastify).generateQuestion(userId2, couple.id);
      }
    });

    job.start();
  }
}