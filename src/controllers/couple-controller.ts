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

  async cancelInvite(req: FastifyRequest<{ Params: { inviteId: string } }>, reply: FastifyReply) {
    try {
      const { inviteId } = req.params;
      
      if (!inviteId) {
        return reply.status(400).send({ message: 'Invalid invite ID' });
      }

      const result = await this.coupleService.cancelInvite(inviteId);
      return reply.status(200).send(result);
    } catch (error) {
      console.error('Controller error:', error);
      if (error instanceof Error && error.message === 'Invite not found.') {
        return reply.status(404).send({ message: 'Invite not found' });
      }
      return reply.status(500).send({ message: 'Internal server error' });
    }
  }
}