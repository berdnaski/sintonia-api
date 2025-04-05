import { Tokens, type Memory } from "@prisma/client";
import { Paginate, PaginationParams } from "../@types/prisma";

export interface IMemory {
  id?: string;
  title: string;
  description: string;
  avatar?: string;
  createdAt?: Date;
  coupleId: string;
  createdByUserId: string;
}

export interface CreateMemory {
  title: string;
  description: string;
  avatar?: string;
  coupleId: string;
  createdByUserId: string;
}

export interface MemorysResponse {
  Memorys: Memory[];
}

export interface MemoryUpdate {
  title?: string;
  description?: string;
  avatar?: string;
}

export interface IMemoryRepository {
  create(memory: CreateMemory): Promise<Memory>;
  findOne(ident: string): Promise<Memory | null>;
  findAll(coupleId: string, params: PaginationParams): Promise<Paginate<Memory>>
  save(id: string, updatedData: MemoryUpdate): Promise<Memory>;
  exists(ident: string): Promise<boolean>;
  remove(id: string): Promise<Memory>;
}
