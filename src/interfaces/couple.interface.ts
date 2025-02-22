import { User, type Couple } from "@prisma/client";

export interface CreateCouple {
  userId: string;
}

export interface UserResponse {
  couples: Couple[];
}

export interface CoupleRepository {
  create(userId: string): Promise<Couple>;
  findById(id: string): Promise<Couple | null>;
}