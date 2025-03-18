import { FastifyInstance, FastifyRequest, type FastifyReply } from "fastify";
import { CreateSignal, type ICreateSignal, type ISignalUpdate } from "../interfaces/signal.interface";
import { SignalService } from "../services/signalService/signal-service";

export class SignalController {
  private signalService: SignalService;

  constructor(app: FastifyInstance) {
    this.signalService = new SignalService(app);
  }

  async create(req: FastifyRequest<{ Body: ICreateSignal }>, reply: FastifyReply) {
    const { userId, coupleId, emotion, note } = req.body;

    const validateBody = CreateSignal.safeParse({ userId, coupleId, emotion, note });

    if (!validateBody.success) {
      const errors = validateBody.error.flatten().fieldErrors
      return reply.status(400).send({
        message: 'Invalid data.',
        errors,
      });
    }

    const result = await this.signalService.generateAnalysis(userId, coupleId, emotion, note);

    if (result.isLeft()) {
      const error = result.value;
      return reply.status(400).send({ message: error.message });
    }

    return reply.status(201).send(result.value);
  }

  async save(req: FastifyRequest<{ Params: { id: string }; Body: ISignalUpdate }>, reply: FastifyReply) {
    const { id } = req.params;
    const updatedData = req.body;

    const updateResult = await this.signalService.save(id, updatedData);

    if (updateResult.isLeft()) {
      const error = updateResult.value;
      return reply.status(400).send({ message: error.message });
    } else {
      return reply.status(200).send(updateResult.value);
    }
  }

  async findOne(req: FastifyRequest<{ Params: { ident: string } }>, reply: FastifyReply) {
    const { ident } = req.params;

    const signalResult = await this.signalService.findOne(ident);

    if (signalResult.isLeft()) {
      const error = signalResult.value;
      return reply.status(404).send({ message: error.message });
    } else {
      return reply.status(200).send(signalResult.value);
    }
  }

  async findAll(req: FastifyRequest, reply: FastifyReply) {
    const signalsResult = await this.signalService.findAll();

    if (signalsResult.isLeft()) {
      const error = signalsResult.value;
      return reply.status(400).send({ message: error.message });
    } else {
      return reply.status(200).send(signalsResult.value);
    }
  }

  async remove(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;

    const removeResult = await this.signalService.remove(id);

    if (removeResult.isLeft()) {
      const error = removeResult.value;
      return reply.status(400).send({ message: error.message });
    } else {
      return reply.status(204).send();
    }
  }
}
