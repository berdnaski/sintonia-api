import { FastifyInstance } from "fastify";
import cron from 'node-cron';
import { sintoniaConfig } from '../config/api';
import { ICoupleRepository } from "../interfaces/couple.interface";
import { CoupleWithUsers, PrismaCoupleRepository } from "../repositories/couple-repository";
import { ChallengeService } from "../services/challengeService/challenge-service";

export class JobWeeklyChallenge {
  private fastify: FastifyInstance;
  private coupleRepository: ICoupleRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.coupleRepository = new PrismaCoupleRepository();
  }

  public start() {
    const job = cron.schedule(sintoniaConfig.jobs.weekly_challenges, async () => {
      const couples = await this.coupleRepository.findAll()
      console.log({couples})
      for (const couple of couples) {
        if (!couple.users.length) {
          continue
        }
        const userId1 = couple.users[0].id;
        const userId2 = couple.users[1].id;

        await new ChallengeService(this.fastify).generateChallenge(userId1, couple.id);
        await new ChallengeService(this.fastify).generateChallenge(userId2, couple.id);
      }
    });

    job.start();
  }
}
