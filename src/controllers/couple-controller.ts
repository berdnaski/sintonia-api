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
      const { inviteId } = req.params;
      
      if (!inviteId) {
        return reply.status(400).send({ message: 'Invalid invite ID' });
      }

      const result = await this.coupleService.cancelInvite(inviteId);
      return reply.status(200).send(result);
  }

  async acceptInvite(req: FastifyRequest<{ Params: { token: string }, Body: { inviteeId: string } }>, reply: FastifyReply) {
    const { token } = req.params;  
    const { inviteeId } = req.body;  
  
    const user = req.user as User;  
    const inviteeIdFromUser = user.id;  
    
    if (inviteeIdFromUser !== inviteeId) {
      return reply.status(400).send({ message: 'O ID do convidado não corresponde ao ID do usuário autenticado.' });
    }

    const couple = await this.coupleService.acceptInvite(token, inviteeId);
    return reply.status(200).send({
      message: 'Convite aceito com sucesso!',
      couple,
    });
  }
}