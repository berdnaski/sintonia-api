import { AIResponse, Signal, User, type Couple } from "@prisma/client";

export interface CreateCouple {
  user1Id: string;
  user2Id: string;
}

export interface CoupleResponse {
  couples: Couple[];
}

export interface CoupleRepository {
  create(data: { relationshipStatus: string; user1Id: string; user2Id: string }): Promise<Couple>
  findById(id: string): Promise<Couple | null>
}