import type { Memory } from "@prisma/client";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import type { IMemoryRepository } from "../../interfaces/memory.interface";
import { left, right, type Either } from "../../errors/either";
import { PrismaMemoryRepository } from "../../repositories/memory-repository";

type createMemoryResponse = Either<RequiredParametersError, Memory>;
type getMemoryByIdResponse = Either<RequiredParametersError, Memory>;
type getAllMemoryResponse = Either<RequiredParametersError, Memory[]>;
type existsMemoryResponse = Either<RequiredParametersError, boolean>;
type removeMemoryResponse = Either<RequiredParametersError, Memory>;
type updateMemoryResponse = Either<RequiredParametersError, Memory>;

export class MemoryService {
  private memoryRepository: IMemoryRepository;
  
  constructor() {
    this.memoryRepository = new PrismaMemoryRepository();
  }

  async create(title: string, description: string, coupleId: string, createdByUserId: string, avatar?: string): Promise<createMemoryResponse> {
    if (!title || !description || !coupleId || !createdByUserId) {
      return left(new RequiredParametersError('Missing required parameters.'));
    }
  
    const memory = await this.memoryRepository.create({
      title,
      description,
      avatar,
      coupleId,
      createdByUserId
    })
  
    return right(memory);
  }
  

  async findOne(id: string): Promise<getMemoryByIdResponse> {
    const memory = await this.memoryRepository.findOne(id);

    if (!memory) {
      return left(new RequiredParametersError('Memory not found.'));
    }

    return right(memory);
  }

  async findAllByCouple(coupleId: string): Promise<getAllMemoryResponse> {
    const memories = await this.memoryRepository.findAll(coupleId); 

    return right(memories);
  }

  async save(id: string, updatedData: { title?: string; description?: string; avatar?: string }): Promise<updateMemoryResponse> {
    const memory = await this.memoryRepository.findOne(id);

    if (!memory) {
      return left(new RequiredParametersError('Memory not found.'));
    }

    const updatedMemory = await this.memoryRepository.save(id, updatedData);

    return right(updatedMemory);
  }

  async exists(id: string): Promise<existsMemoryResponse> {
    const exists = await this.memoryRepository.exists(id);

    return right(exists);
  }

  async remove(id: string): Promise<removeMemoryResponse> {
    const memory = await this.memoryRepository.findOne(id);

    if (!memory) {
      return left(new RequiredParametersError('Memory not found.'));
    }

    const deletedMemory = await this.memoryRepository.remove(id);

    return right(deletedMemory);
  }
}
