import { Tokens } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { ITokensRepository } from "../interfaces/token.interface";

export class PrismaTokensRepository  implements ITokensRepository{
  async create(token: Tokens): Promise<Tokens> {
    const query = await prisma.tokens.create({
      data: {
        id: token.id,
        type: token.type,
        user_id: token.user_id,
        used: token.used,
        expiresIn: token.expiresIn,
      }
    });

    return query
  }

  async save(tokens: Tokens): Promise<void> {
    await prisma.tokens.update({
      data: {
        type: tokens.type,
        user_id: tokens.user_id,
        used: tokens.used,
        expiresIn: tokens.expiresIn,
      },
      where: {
        id: tokens.id,
      },
    });
  }

  async getById(id: string): Promise<Tokens | null> {
    const dbQuery = await prisma.tokens.findUnique({ where: { id } });

    if (!dbQuery) {
      return null;
    }

    return dbQuery as unknown as Tokens;
  }

  async exists(id: string): Promise<boolean> {
    const dbQuery = await prisma.tokens.findUnique({
      where: { id },
    });
    return !!dbQuery;
  }

  async remove(id: string): Promise<void> {
    await prisma.tokens.delete({
      where: { id },
    });
  }

  async saveSingle(token: Tokens): Promise<void> {
    const data = {
      type: token.type,
      user_id: token.user_id,
      used: token.used,
      expiresIn: token.expiresIn,
    };

    await prisma.tokens.update({
      where: { id: token.id },
      data,
    });
  }

  async findByTypeAndUserIdAndUsed(
    type: string,
    userId: string,
    used: boolean
  ): Promise<Tokens[]> {
    const tokens = await prisma.tokens.findMany({
      where: {
        type,
        user_id: userId,
        used,
      },
    });

    return tokens.map(dbToken => ({
      id: dbToken.id,
      type: dbToken.type,
      userId: dbToken.user_id,
      used: dbToken.used,
      expiresIn: dbToken.expiresIn,
    })) as unknown as Tokens[];;
  }
}