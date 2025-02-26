import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateCoupleInvite } from '../interfaces/couple.interface';
import { CreateUser } from '../interfaces/user.interface';
import { CoupleService } from '../services/coupleService/couple-service';
import type { User } from '@prisma/client';

export class CoupleController {
  private coupleService: CoupleService;

  constructor(app: FastifyInstance) {
    this.coupleService = new CoupleService(app);
  }

  async invitePartner(req: FastifyRequest<{ Body: CreateCoupleInvite }>, reply: FastifyReply) {
    const { email } = req.body

    const user = req.user as User;
    
    const userId = user.id;

    console.log("userId", userId);

    const validateBody = CreateCoupleInvite.safeParse({ email });
    if (!validateBody.success) {
      const errors = validateBody.error.flatten().fieldErrors
      return reply.status(400).send({
        message: 'Invalid data.',
        errors,
      });
    }

    const result = await this.coupleService.invitePartner(userId, email);
    reply.status(200).send(result);
  }
}