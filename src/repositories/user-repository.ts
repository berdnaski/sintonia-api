import { User } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import { CreateUser, IUserRepository, UserUpdate } from "../interfaces/user.interface";

export class PrismaUserRepository implements IUserRepository {
  async create(user: CreateUser): Promise<User | null> {
    const query = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        stripeCustomerId: user.stripeCustomerId,
      },
      include: {
        subscriptions: true,
        signals: true,
      },
    });

    if (!query) return null;

    return query;
  }

  async exists(ident: string): Promise<boolean> {
    const query = await prisma.user.findFirst({
      where: {
        OR: [{ email: ident }, { id: ident }],
      },
    });

    return !!query;
  }

  async findOne(ident: string): Promise<User> {
    const query = await prisma.user.findFirst({
      where: {
        OR: [{ email: ident }, { id: ident }],
      },
      include: {
        Tokens: true
      }
    });

    return query as User;
  }

  async findAll(): Promise<User[]> {
    const query = await prisma.user.findMany();
    return query.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })) as unknown as User[];
  }

  async delete(id: string): Promise<User> {
    const result = await prisma.user.delete({
      where: { id }
    })

    return result;
  }

  async save(id: string, data: UserUpdate): Promise<User> {
    const result = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        avatarUrl: data.avatarUrl,
      }
    })

    return result;
  }
}
