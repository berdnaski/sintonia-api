import type { Couple, User } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CoupleInviteService } from '../services/coupleInvitesService/couple-invites.service';

export class CoupleInviteController {
  private coupleInviteService: CoupleInviteService;

  constructor(app: FastifyInstance) {
    this.coupleInviteService = new CoupleInviteService();
  }

  async findByToken(req: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply): Promise<Couple> {
    const { token } = req.params;
    const invite = await this.coupleInviteService.getCoupleInviteByToken(token);

    if (!invite || invite.isLeft()) {
      reply.status(404).send({
        message: 'Invite not found.',
        code: 'NOT_FOUND'
      });
    }

    return reply.status(200).send(invite.value);
  }

  async findInviteByInviterId(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply): Promise<Couple> {
    const { userId } = req.params;
    const invite = await this.coupleInviteService.findInviteByInviterId(userId);

    if (!invite || invite.isLeft()) {
      reply.status(404).send({
        message: 'Invite not found.',
        code: 'NOT_FOUND'
      });
    }

    return reply.status(200).send(invite.value);
  }
}
