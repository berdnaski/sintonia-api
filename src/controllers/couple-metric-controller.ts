import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CoupleService } from '../services/coupleService/couple-service';
import { CoupleMetricService } from '../services/coupleMetricService/couple-metric-service';

export class CoupleMetricController {
  private service: CoupleMetricService;
  private coupleService: CoupleService;

  constructor(app: FastifyInstance) {
    this.service = new CoupleMetricService(app);
    this.coupleService = new CoupleService(app)
  }

  async findByCoupleId(req: FastifyRequest<{ Params: { coupleId: string} }>, reply: FastifyReply) {
    const { coupleId } = req.params
    const metric = await this.service.findByCoupleId(coupleId)

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

    reply.status(200).send(metric.value);
  }
}
