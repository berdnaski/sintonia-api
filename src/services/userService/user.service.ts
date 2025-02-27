import { User } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../database/prisma-client";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import type { IUserRepository, UserUpdate } from "../../interfaces/user.interface";
import { PrismaUserRepository } from "../../repositories/user-repository";

type findAllResponse = Either<RequiredParametersError, User[]>
type findOneResponse = Either<RequiredParametersError, User>
type deleteResponse = Either<RequiredParametersError, User>
type saveResponse = Either<RequiredParametersError, User>

class UserService {
  private fastify: FastifyInstance;
  private userRepository: IUserRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.userRepository = new PrismaUserRepository();
  }

  async findAll(): Promise<findAllResponse> {
    const users = await this.userRepository.findAll();

    return right(users)
  }

  async findOne(ident: string): Promise<findOneResponse> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: ident },
          { email: ident },
        ]
      },
    });

    if (!user) {
      return left(new RequiredParametersError("User not found"));
    }

    return right(user)
  }

  async delete(id: string): Promise<deleteResponse> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      return left(new RequiredParametersError("User not found"));
    }

    await this.userRepository.delete(id);
    return right(user)
  }

  async save(id: string, updateData: UserUpdate): Promise<saveResponse> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      return left(new RequiredParametersError("User not found"));
    }

    const updatedUser = await this.userRepository.save(id, updateData);

    return right(updatedUser)
  }
}

export { UserService };

