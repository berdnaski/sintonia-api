import { Couple, CoupleInvite } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { ICoupleRepository } from "../interfaces/couple.interface";

export class PrismaCoupleRepository implements ICoupleRepository {
  async findCoupleByUserId(userId: string): Promise<Couple | null> {
    return prisma.couple.findFirst({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      }

    });
  }

  async createCouple(user1Id: string, user2Id: string, status: string): Promise<Couple> {
    return prisma.couple.create({
      data: { user1Id, user2Id, relationshipStatus: status },
    });
  }

  async deleteCouple(id: string): Promise<void> {
    await prisma.$transaction([
      // Excluir os registros dependentes na tabela ai_responses
      prisma.aIResponse.deleteMany({
        where: { coupleId: id },
      }),

      // Excluir os sinais relacionados
      prisma.signal.deleteMany({
        where: { coupleId: id },
      }),

      // Excluir o couple
      prisma.couple.delete({
        where: { id },
      }),
    ]);
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

  async findAll(): Promise<Couple[]> {
    return prisma.couple.findMany();
  }

  async findOne(ident: string): Promise<Couple> {
    const query = await prisma.couple.findFirst({
      where: {
        id: ident
      }
    })

    return query as Couple;
  }

  async delete(id: string): Promise<Couple> {
    const result = await prisma.couple.delete({
      where: { id }
    })

    return result;
  }
}
