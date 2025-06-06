import type { Memory } from "@prisma/client";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import type { CreateMemory, IMemoryRepository } from "../../interfaces/memory.interface";
import { left, right, type Either } from "../../errors/either";
import { PrismaMemoryRepository } from "../../repositories/memory-repository";
import { Paginate, PaginationParams } from "../../@types/prisma";
import { R2StorageProvider } from "../../providers/storage/implementations/r2-storage-provider";
import type { StorageProvider } from "../../providers/storage/storage-provider";

type createMemoryResponse = Either<RequiredParametersError, Memory>;
type getMemoryByIdResponse = Either<RequiredParametersError, Memory>;
type getAllMemoryResponse = Either<RequiredParametersError, Paginate<Memory>>;
type existsMemoryResponse = Either<RequiredParametersError, boolean>;
type removeMemoryResponse = Either<RequiredParametersError, Memory>;
type updateMemoryResponse = Either<RequiredParametersError, Memory>;

export class MemoryService {
  private memoryRepository: IMemoryRepository;
  private storageProvider: StorageProvider;

  constructor() {
    this.memoryRepository = new PrismaMemoryRepository();
    this.storageProvider = new R2StorageProvider();
  }

  async create(data: CreateMemory): Promise<createMemoryResponse> {
    if (!data.title || !data.description || !data.coupleId || !data.createdByUserId) {
      return left(new RequiredParametersError('Missing required parameters.'));
    }

    const memory = await this.memoryRepository.create(data);

    return right(memory);
  }


  async findOne(id: string): Promise<getMemoryByIdResponse> {
    const memory = await this.memoryRepository.findOne(id);

    if (!memory) {
      return left(new RequiredParametersError('Memory not found.'));
    }

    return right(memory);
  }

  async findAllByCouple(
    coupleId: string,
    params: PaginationParams
  ): Promise<getAllMemoryResponse> {
    if (!coupleId) {
      return left(new RequiredParametersError('Couple ID is required.'));
    }

    const memories = await this.memoryRepository.findAll(coupleId, params);

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

    if (memory.avatarUrl) {
      try {
        await this.storageProvider.delete(memory.avatarUrl);
      } catch (error) {
        console.error('Error deleting memory image:', error);
      }
    }

    const deletedMemory = await this.memoryRepository.remove(id);

    return right(deletedMemory);
  }
}
