import type { FastifyInstance } from "fastify";
import type { UserRepository, UserResponse, UserUpdate } from "../../interfaces/user.interface";
import { UserRepositoryPrisma } from "../../repositories/user-repository";
import type { User } from "@prisma/client";

class UserService {
  private fastify: FastifyInstance;
  private userRepository: UserRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.userRepository = new UserRepositoryPrisma();
  }

  async findAll(): Promise<UserResponse> {
    const users = await this.userRepository.findAll();

    return { users }
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);

    return { user };
  }

  async delete(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
  }

  async update(id: string, updateData: UserUpdate) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await this.userRepository.update(id, updateData);

    return { user: updatedUser };
  }
}

export { UserService };