import type { Couple, User } from '@prisma/client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateCoupleInvite } from '../interfaces/couple.interface';
import { CoupleInviteService } from '../services/coupleInvitesService/couple-invites.service';
import { CoupleService } from '../services/coupleService/couple-service';
import { CoupleMetricService } from '../services/coupleMetricService/couple-metric-service';

export class CoupleController {
  private coupleService: CoupleService;
  private metricService: CoupleMetricService;

  constructor(app: FastifyInstance) {
    this.coupleService = new CoupleService(app);
    this.metricService = new CoupleMetricService(app);
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
      couple: couple.value,
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

  async findByUserId(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply): Promise<Couple> {
    const { userId } = req.params;
    const couple = await this.coupleService.findByUserId(userId);

    if (couple.isLeft()) {
      return reply.status(couple.value.statusCode).send({
        message: "Couple not found",
        code: couple.value.code
      })
    }

    return reply.status(200).send(couple.value);
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<Couple> {
    const { id } = req.params;
    const couple = await this.coupleService.delete(id);
    return reply.status(200).send(couple);
  }

  async metrics(req: FastifyRequest<{ Params: { coupleId: string} }>, reply: FastifyReply): Promise<Couple> {
    const { coupleId } = req.params
    const metric = await this.metricService.findByCoupleId(coupleId)

    if (metric.isLeft()) {
      return reply.status(metric.value.statusCode).send({
        message: metric.value.message,
        code: metric.value.code
      });
    }

    const jwt = await req.jwtVerify<{
      id: string;
      email: string;
    }>();

    const couple = await this.coupleService.findByUserId(jwt.id)

    if (couple.isLeft()) {
      return reply.status(couple.value.statusCode).send({
        message: couple.value.message,
        code: couple.value.code
      });
    }

    if (couple.value.id !== coupleId) {
      return reply.status(404).send({
        message: "Couple or metric not found.",
        code: "NOT_FOUND"
      });
    }

    const avgTotal = this.metricService.calculateAvgTotal(metric.value)

    const response = {
      ...metric.value,
      avgTotal
    }

    console.log({avgTotal, response})
    return reply.status(200).send(response);
  }
}
