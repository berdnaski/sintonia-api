import { prisma } from "infra/prisma/prisma-client";
import { Password } from "modules/accounts/entities/password";
import { User } from "../../entities/User";
import { IUsersRepository } from "../IUserRepository";

export class PrismaUserRepository implements IUsersRepository {
  async create(user: User): Promise<void> {
    const hashedPassword = await user.password.getHashedPassword();

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        password: hashedPassword,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        coupleId: user.coupleId,
      },
      include: {
        couple: true,
      }
    });
  }

  async exists(ident: string): Promise<boolean> {
    const query = await prisma.user.findFirst({
      where: {
        OR: [{ email: ident }, { id: ident }],
      },
    });

    return !!query;
  }

  async save(user: User): Promise<void> {
    const hashedPassword = await user.password.getHashedPassword();

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.email.value,
        name: user.name,
        password: hashedPassword,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        coupleId: user.coupleId,
      },
    });
  }

  async findOne(ident: string): Promise<User | null> {
    const query = await prisma.user.findFirst({
      where: {
        OR: [{ email: ident }, { id: ident }],
      },
    });

    if (!query) {
      throw new Error("User not found");
    }

    return {
      id: query.id,
      name: query.name,
      email: query.email,
      password: query.password,
      coupleId: query.coupleId,
    } as unknown as User;
  }

  async findAll(): Promise<User[]> {
    const query = await prisma.user.findMany();
    return query.map((user) => ({
      id: user.id,
      name:  user.name,
      email: user.email,
      coupleId: user.coupleId,
      createdAt: user.createdAt,
    })) as unknown as User[];
  }
}