import { Couple, CoupleInvite } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { ICoupleRepository } from "../interfaces/couple.interface";

export class PrismaCoupleRepository implements ICoupleRepository {
  async findCoupleByUserId(userId: string): Promise<Couple | null> {
    return prisma.couple.findFirst({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    });
  }

  async createCouple(user1Id: string, user2Id: string, status: string): Promise<Couple> {
    return prisma.couple.create({
      data: { user1Id, user2Id, relationshipStatus: status },
    });
  }

  async deleteCouple(id: string): Promise<void> {
    prisma.couple.delete({ where: { id } });
  }

  async createInvite(data: { inviterId: string; inviteeEmail: string; token: string; expiresAt: number }): Promise<CoupleInvite> {
    return prisma.coupleInvite.create({
      data: {
        inviterId: data.inviterId,
        inviteeEmail: data.inviteeEmail,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async deleteInvite(id: string): Promise<void> {
    await prisma.coupleInvite.delete({ where: { id } });
  }

  async acceptInvite(inviterId: string, inviteeId: string): Promise<Couple> {
    return prisma.couple.create({
      data: {
        user1Id: inviterId,
        user2Id: inviteeId,
        relationshipStatus: "active",
      },
    });
  }
}