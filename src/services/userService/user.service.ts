import type { FastifyInstance } from "fastify";
import type { UserRepository, UserResponse, UserUpdate } from "../../interfaces/user.interface";
import { PrismaUserRepository } from "../../repositories/user-repository";

class UserService {
  private fastify: FastifyInstance;
  private userRepository: UserRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.userRepository = new PrismaUserRepository();
  }

  async findAll(): Promise<UserResponse> {
    const users = await this.userRepository.findAll();

    return { users }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id);

    return { user };
  }

  async delete(id: string) {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
  }

  async update(id: string, updateData: UserUpdate) {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await this.userRepository.save(id, updateData);

    return { user: updatedUser };
  }
}

export { UserService };
