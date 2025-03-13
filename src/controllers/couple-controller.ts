import type { Couple, User } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateCoupleInvite } from '../interfaces/couple.interface';
import { CoupleInviteService } from '../services/coupleInvitesService/coupleInvites-.service';
import { CoupleService } from '../services/coupleService/couple-service';

export class CoupleController {
  private coupleService: CoupleService;
  private coupleInviteService: CoupleInviteService;

  constructor(app: FastifyInstance) {
    this.coupleService = new CoupleService(app);
    this.coupleInviteService = new CoupleInviteService();
  }

  async invitePartner(req: FastifyRequest<{ Body: CreateCoupleInvite }>, reply: FastifyReply) {
    const { email } = req.body

    const user = req.user as User;
    const userId = user.id;

    if (user.email === email) {
      return reply.status(400).send({
        message: 'You cannot invite yourself.'
      });
    }

    const validateBody = CreateCoupleInvite.safeParse({ email });

    if (!validateBody.success) {
      const errors = validateBody.error.flatten().fieldErrors
      return reply.status(400).send({
        message: 'Invalid data.',
        errors,
      });
    }

    const result = await this.coupleService.invitePartner(userId, email);

    if (result.isLeft()) {
      return reply.status(400).send({
        message: result.value.message
      });
    }

    reply.status(200).send(result.value);
  }

  async cancelInvite(req: FastifyRequest<{ Params: { inviteId: string } }>, reply: FastifyReply) {
    const { inviteId } = req.params;
    const user = req.user as User;
    const inviterId = user.id;

    if (!inviteId) {
      return reply.status(400).send({ message: 'Invalid invite ID' });
    }

    const result = await this.coupleService.cancelInvite(inviteId, inviterId);
    return reply.status(200).send(result);
  }

  async acceptInvite(req: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    const { token } = req.params;

    const user = req.user as User;
    const inviteeId = user.id;

    const couple = await this.coupleService.acceptInvite(token, inviteeId);
    return reply.status(200).send({
      message: 'Invitation accepted successfully!',
      couple,
    });
  }

  async findAll(req: FastifyRequest, reply: FastifyReply): Promise<Couple[]> {
    const couples = await this.coupleService.findAll();
    return reply.status(200).send(couples);
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<Couple> {
    const { id } = req.params;
    const couple = await this.coupleService.findOne(id);
    return reply.status(200).send(couple);
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<Couple> {
    const { id } = req.params;
    const couple = await this.coupleService.delete(id);
    return reply.status(200).send(couple);
  }
}
