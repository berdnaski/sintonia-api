import type { FastifyInstance } from "fastify";
import type { CreateUser, UserLogin, UserRepository } from "../../interfaces/user.interface";
import { PrismaUserRepository } from "../../repositories/user-repository";
import { hashPassword, verifyPassword } from "../../utils/hash";

class AuthService {
  private fastify: FastifyInstance;
  private userRepository: UserRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.userRepository = new PrismaUserRepository();
  }

  async register(data: CreateUser) {
    const verifyIfExists = await this.userRepository.findOne(data.email);

    if (verifyIfExists) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.userRepository.create({
      ...data,
      name: data.name,
      email: data.email,
      password: hashedPassword,
    })

    const token = this.fastify.jwt.sign({
      sub: user?.id
    })

    return {
      user,
      token
    };
  }

  async login(data: UserLogin) {
    const user = await this.userRepository.findOne(data.email);

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await verifyPassword(data.password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    const token = this.fastify.jwt.sign({
      sub: user.id
    });

    return {
      user,
      token
    };
  }
}

export { AuthService };

