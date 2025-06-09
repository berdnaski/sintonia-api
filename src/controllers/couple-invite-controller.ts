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

  async deleteByInviterId(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply): Promise<void> {
    const { userId } = req.params;

    const inviteResult = await this.coupleInviteService.findInviteByInviterId(userId);

    if (!inviteResult || inviteResult.isLeft() || !inviteResult.value) {
      return reply.status(404).send({
        message: 'Invite not found',
        code: 'NOT_FOUND'
      });
    }

    const inviteId = inviteResult.value.id;
    const deleteResult = await this.coupleInviteService.deleteCoupleInvite(inviteId);

    if (deleteResult.isLeft()) {
      return reply.status(400).send({
        message: deleteResult.value.message,
        code: 'BAD_REQUEST'
      });
    }
  
    return reply.status(204).send();
  }
}
