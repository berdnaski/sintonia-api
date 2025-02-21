import type { User } from "@prisma/client";
import type { CreateUser, UserRepository } from "../interfaces/user.interface";
import { prisma } from "../database/prisma-client";

class UserRepositoryPrisma implements UserRepository {
  async create(data: CreateUser): Promise<User> {
    const result = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        avatarUrl: data.avatarUrl || null,
      }
    })

    return result;
  }
  async findByEmail(email: string): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { email }
    })

    return result || null;
  }
}

export { UserRepositoryPrisma }