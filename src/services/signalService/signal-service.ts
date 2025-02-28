import type { FastifyInstance } from "fastify";
import type { ICreateSignal, ISignal, ISignalRepository, ISignalUpdate } from "../../interfaces/signal.interface";
import { PrismaSignalRepository } from "../../repositories/signal-repository";
import { left, right, type Either } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import type { Signal } from "@prisma/client";

type createSignalResponse = Either<RequiredParametersError, Signal>;
type saveSignalResponse = Either<RequiredParametersError, Signal>;
type getSignalByIdResponse = Either<RequiredParametersError, Signal>;
type getAllSignalResponse = Either<RequiredParametersError, Signal[]>;
type existsSignalResponse = Either<RequiredParametersError, boolean>;
type removeSignalResponse = Either<RequiredParametersError, Signal>;

export class SignalService {
  private signalRepository: ISignalRepository;

  constructor(fastify: FastifyInstance) {
    this.signalRepository = new PrismaSignalRepository();
  }

  async create(signal: ICreateSignal): Promise<createSignalResponse> {
    const result = await this.signalRepository.create({
      userId: signal.userId,
      coupleId: signal.coupleId,
      emotion: signal.emotion,
      note: signal.note,
    });
  
    return right(result);
  }

  async save(id: string, updateData: ISignalUpdate): Promise<saveSignalResponse> {
    const signal = await this.signalRepository.findOne(id);

    if (!signal) {
      return left(new RequiredParametersError('Signal not found'));
    }

    const updatedSignal = { ...signal, ...updateData };
    await this.signalRepository.save(id, updatedSignal);

    return right(updatedSignal);
  }

  async findOne(ident: string): Promise<getSignalByIdResponse> {
    const result = await this.signalRepository.findOne(ident);

    return right(result);
  }

  async findAll(): Promise<getAllSignalResponse> {
    const signals = await this.signalRepository.findAll();

    return right(signals);
  }

  async exists(ident: string): Promise<existsSignalResponse> {
    const result = await this.signalRepository.exists(ident);

    return right(result);
  }

  async remove(id: string): Promise<removeSignalResponse> {
    const signal = await this.signalRepository.findOne(id);

    if (!signal) {
      return left(new RequiredParametersError('Signal not found'));
    }

    const result = await this.signalRepository.remove(id);

    return right(result);
  }
}
