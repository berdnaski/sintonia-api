import { Couple, CoupleInvite, User } from "@prisma/client";
import z from 'zod';

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

export interface ListCouplesResponse {
  couples: Couple[];
}

export interface ICoupleRepository {
  findCoupleByUserId(userId: string): Promise<Couple | null>;
  createCouple(user1Id: string, user2Id: string, status: string): Promise<Couple>;
  deleteCouple(coupleId: string): Promise<void>;
  createInvite(data: { inviterId: string; inviteeEmail: string; token: string; expiresAt: number }): Promise<CoupleInvite>;
  findInviteByToken(token: string): Promise<CoupleInvite | null>
  deleteInvite(id: string): Promise<void>;
  acceptInvite(inviterId: string, inviteeId: string): Promise<Couple>;
}