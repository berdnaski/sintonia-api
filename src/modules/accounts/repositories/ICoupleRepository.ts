import { Couple } from "../entities/Couple";

export interface ICoupleRepository {
  create(userId: string): Promise<Couple>
  findById(id: string): Promise<Couple | null>
}