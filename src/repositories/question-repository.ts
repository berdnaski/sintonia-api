import { Question } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { ICreateQuestion, IQuestionsRepository, IUpdateQuestion } from "../interfaces/question.interface";

export class PrismaQuestionRepository implements IQuestionsRepository {
  async create(question: ICreateQuestion): Promise<Question> {
    const query = await prisma.question.create({
      data: {
        ...question
      }
    })

    return query
  }

  async exists(ident: string): Promise<boolean> {
    const query = await prisma.question.findFirst({
      where: {
        OR: [{ id: ident }, { coupleId: ident }, { userId: ident }]
      }
    })

    return !!query
  }

  async save(id: string, updateData: IUpdateQuestion): Promise<Question> {
    const query = await prisma.question.update({
      where: {
        id
      },
      data: {
        ...updateData
      }
    })

    return query
  }

  async remove(id: string): Promise<Question> {
    const query = await prisma.question.delete({
      where: {
        id
      }
    })

    return query
  }

  async findAll(userId: string): Promise<Question[]> {
    const query = await prisma.question.findMany({
      where: {
        userId: userId
      },
      orderBy: { createdAt: 'desc' }
    })

    return query
  }

  async findOne(ident: string): Promise<Question | null> {
    const query = await prisma.question.findFirst({
      where: {
        OR: [{ id: ident }, { coupleId: ident }, { userId: ident }]
      }
    })

    return query
  }
}