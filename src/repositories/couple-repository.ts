import { Couple, CoupleInvite, User } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { ICoupleRepository, UpdateCopule } from "../interfaces/couple.interface";


export type CoupleWithUsers = Couple & {
  users: Pick<User, 'id' | 'name' | 'email' | 'stripeSubscriptionStatus'>[];
};

export class PrismaCoupleRepository implements ICoupleRepository {
  async findCoupleByUserId(userId: string): Promise<CoupleWithUsers | null> {
    return prisma.couple.findFirst({
      where: {
        users: {
          some: { id: userId },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeSubscriptionStatus: true,
          },
        },
      }
    });
  }

  async createCouple(status: string): Promise<Couple> {
    return prisma.couple.create({
      data: { relationshipStatus: status },
    });
  }

  async deleteCouple(id: string): Promise<void> {
    await prisma.$transaction([
      prisma.aIResponse.deleteMany({
        where: { coupleId: id },
      }),

      prisma.signal.deleteMany({
        where: { coupleId: id },
      }),

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

  async findAll(): Promise<Couple[]> {
    return prisma.couple.findMany();
  }

  async findOne(ident: string): Promise<Couple> {
    const query = await prisma.couple.findFirst({
      where: {
        id: ident
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeSubscriptionStatus: true,
          },
        }
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

    async update(id: string, data: UpdateCopule): Promise<Couple> {
      const result = await prisma.couple.update({
        where: {
          id,
        },
        data
      })

      return result;
    }
}
