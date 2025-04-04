import { Couple, CoupleInvite, User } from "@prisma/client";
import z from 'zod';
import { CoupleWithUsers } from "../repositories/couple-repository";

export interface ICouple {
  id?: string;
  user1Id: string;
  user2Id: string;
  status?: string;
  createdAt?: Date;
}

export const AcceptCoupleInvite = z.object({
  token: z.string(),
});
export type AcceptCoupleInvite = z.infer<typeof AcceptCoupleInvite>;

export const CreateCoupleInvite = z.object({
  email: z.string().email('Invalid email'),
});

export type CreateCoupleInvite = z.infer<typeof CreateCoupleInvite>;

export interface CreateCoupleResponse {
  couple: Couple;
}

export type UpdateCopule = Partial<Omit<Couple, 'id' | 'createdAt'>>;

export interface ListCouplesResponse {
  couples: Couple[];
}

export interface ICoupleRepository {
  findCoupleByUserId(userId: string): Promise<CoupleWithUsers | null>;
  createCouple(status: string): Promise<Couple>;
  deleteCouple(coupleId: string): Promise<void>;
  createInvite(data: { inviterId: string; inviteeEmail: string; token: string; expiresAt: number }): Promise<CoupleInvite>;
  deleteInvite(id: string): Promise<void>;
  findAll(): Promise<Couple[]>;
  findOne(ident: string): Promise<Couple>;
  delete(id: string): Promise<Couple>;
  update(id: string, data: UpdateCopule): Promise<Couple>;
}
