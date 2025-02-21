import type { User } from "@prisma/client";
import type { CreateUser, UserRepository, UserUpdate } from "../interfaces/user.interface";
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

  async findById(id: string): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { id }
    })

    return result || null;
  }

  async findAll(): Promise<User[]> {
    const result = await prisma.user.findMany();

    return result;
  }

  async delete(id: string): Promise<User> {
    const result = await prisma.user.delete({
      where: { id }
    })

    return result;
  }

  async update(id: string, data: UserUpdate): Promise<User> {
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

export { UserRepositoryPrisma }