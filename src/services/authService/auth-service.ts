import { FastifyInstance } from "fastify";
import { CreateUser, UserLogin, IUserRepository } from "../../interfaces/user.interface";
import { PrismaUserRepository } from "../../repositories/user-repository";
import { hashPassword, verifyPassword } from "../../utils/hash";

class AuthService {
  private fastify: FastifyInstance;
  private userRepository: IUserRepository;

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

    console.log('Generate hashed password: ', hashedPassword);

    const user = await this.userRepository.create({
      ...data,
      name: data.name,
      email: data.email,
      password: hashedPassword,
    })

    const token = this.fastify.jwt.sign({
      id: user?.id,
      email: user?.email,
    });

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

    if (isValidPassword === false) {
      throw new Error("Invalid password");
    }

    const token = this.fastify.jwt.sign({
      id: user?.id,
      email: user?.email,
    });

    return {
      user,
      token
    };
  }
}

export { AuthService };