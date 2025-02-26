import { User } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../database/prisma-client";
import type { IUserRepository, UserUpdate } from "../../interfaces/user.interface";
import { PrismaUserRepository } from "../../repositories/user-repository";

class UserService {
  private fastify: FastifyInstance;
  private userRepository: IUserRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.userRepository = new PrismaUserRepository();
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.findAll();

    return users as unknown as User[];
  }

  async findOne(ident: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: ident },
          { email: ident },
        ]
      },
    });

    if (!user) {
      return null
    }

    return user as unknown as User
  }

  async delete(id: string): Promise<User> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
    return user
  }

  async save(id: string, updateData: UserUpdate): Promise<User> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await this.userRepository.save(id, updateData);

    return { user: updatedUser } as unknown as User;
  }
}

export { UserService };
