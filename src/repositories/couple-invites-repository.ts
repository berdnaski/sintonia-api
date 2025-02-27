import { CoupleInvite } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { ICoupleInviteRepository } from "../interfaces/couple-invite.interface";

export class PrismaCoupleInvitesRepository implements ICoupleInviteRepository {
  async create(coupleInvite: CoupleInvite): Promise<CoupleInvite> {
    const query = await prisma.coupleInvite.create({
      data: {
        id: coupleInvite.id,
        used: coupleInvite.used,
        inviterId: coupleInvite.inviterId,
        inviteeEmail: coupleInvite.inviteeEmail,
        token: coupleInvite.token,
        expiresAt: coupleInvite.expiresAt,
      }
    });

    return query
  }

  async save(coupleInvite: CoupleInvite): Promise<void> {
    await prisma.coupleInvite.update({
      data: {
        id: coupleInvite.id,
        used: coupleInvite.used,
        inviterId: coupleInvite.inviterId,
        inviteeEmail: coupleInvite.inviteeEmail,
        token: coupleInvite.token,
        expiresAt: coupleInvite.expiresAt,
      },
      where: {
        id: coupleInvite.id,
      },
    });
  }

  async getById(id: string): Promise<CoupleInvite | null> {
    const dbQuery = await prisma.coupleInvite.findUnique({ where: { id } });

    if (!dbQuery) {
      return null;
    }

    return dbQuery as unknown as CoupleInvite;
  }

  async exists(id: string): Promise<boolean> {
    const dbQuery = await prisma.coupleInvite.findUnique({
      where: { id },
    });
    return !!dbQuery;
  }

  async remove(id: string): Promise<void> {
    await prisma.coupleInvite.delete({
      where: { id },
    });
  }

  async saveSingle(coupleInvite: CoupleInvite): Promise<void> {
    const data = {
      id: coupleInvite.id,
      used: coupleInvite.used,
      inviterId: coupleInvite.inviterId,
      inviteeEmail: coupleInvite.inviteeEmail,
      token: coupleInvite.token,
      expiresAt: coupleInvite.expiresAt,
    };

    await prisma.coupleInvite.update({
      where: { id: coupleInvite.id },
      data,
    });
  }
  
  async findInviteByToken(token: string): Promise<CoupleInvite | null> {
    return prisma.coupleInvite.findUnique({
      where: { token },
    });
  }

  async findInviteByInviteeEmail(email: string): Promise<CoupleInvite | null> {
    return prisma.coupleInvite.findFirst({
      where: { inviteeEmail: email, used: false },
    });
  }
}