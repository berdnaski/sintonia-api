import { Challenge, ChallengeTypeAnswer } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { IChallengeRepository, ICreateChallenge } from "../interfaces/challenge-interface";

export class PrismaChallengeRepository implements IChallengeRepository {
  async create(challenge: ICreateChallenge): Promise<Challenge> {
    const query = await prisma.challenge.create({
      data: {
        ...challenge
      }
    })

    return query
  }

  async exists(ident: string): Promise<boolean> {
    const query = await prisma.challenge.findFirst({
      where: {
        OR: [{ id: ident }, { coupleId: ident }, { userId: ident }]
      }
    })

    return !!query
  }

  async save(id: string, answer: ChallengeTypeAnswer): Promise<Challenge> {
    const query = await prisma.challenge.update({
      where: {
        id
      },
      data: {
        answer
      }
    })

    return query
  }

  async remove(id: string): Promise<Challenge> {
    const query = await prisma.challenge.delete({
      where: {
        id
      }
    })

    return query
  }

  async findAll(userId: string): Promise<Challenge[]> {
    const query = await prisma.challenge.findMany({
      take: 4,
      where: {
        userId: userId
      },
      orderBy: { createdAt: 'desc' }
    })

    return query
  }

  async findOne(ident: string): Promise<Challenge | null> {
    const query = await prisma.challenge.findFirst({
      where: {
        OR: [{ id: ident }, { coupleId: ident }, { userId: ident }]
      }
    })

    return query
  }
}
