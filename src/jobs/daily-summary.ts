import { FastifyInstance } from "fastify";
import cron from "node-cron";
import { sintoniaConfig } from "../config/api";
import { ICoupleRepository } from "../interfaces/couple.interface";
import { PrismaCoupleRepository } from "../repositories/couple-repository";
import { SummaryService } from "../services/summaryService/summary-service";

export class JobDailySummary {
  private fastify: FastifyInstance;
  private coupleRepository: ICoupleRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.coupleRepository = new PrismaCoupleRepository();
  }

  public start() {
    const job = cron.schedule(sintoniaConfig.jobs.daily_summary, async () => {
      const couples = await this.coupleRepository.findAll();
      for (const couple of couples) {
        if (!couple.users.length) {
          console.log(`[JobDailySummary] Casal ${couple.id} sem usuários, pulando.`);
          continue;
        }
  
        try {
          const result = await new SummaryService(this.fastify).generate(couple.id);
          if (result.isLeft()) {
            console.log(`[JobDailySummary] Não gerou resumo para casal ${couple.id}: ${result.value.message}`);
          } else {
            console.log(`[JobDailySummary] Resumo gerado para casal ${couple.id}`);
          }
        } catch (error) {
          console.error(`[JobDailySummary] Erro gerando resumo para casal ${couple.id}`, error);
        }
      }
    });
  
    job.start();
  }
  
}
