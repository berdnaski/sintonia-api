import { User } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { CreateUser, IUserRepository, UserLogin } from "../../interfaces/user.interface";
import { PrismaUserRepository } from "../../repositories/user-repository";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { createStripeCustomer } from "../../utils/stripe";

type UserResponse = {
  user: User | null;
  token: string;
}

type registerResponse = Either<RequiredParametersError, UserResponse>;
type loginResponse = Either<RequiredParametersError, UserResponse>;

class AuthService {
  private fastify: FastifyInstance;
  private userRepository: IUserRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.userRepository = new PrismaUserRepository();
  }

  async register(data: CreateUser): Promise<registerResponse> {
    const verifyIfExists = await this.userRepository.findOne(data.email);

    if (verifyIfExists) {
      return left(new RequiredParametersError("Email already in use"));
    }

    const hashedPassword = await hashPassword(data.password);

    const customer = await createStripeCustomer({
      email: data.email,
      name: data.name,
    });

    console.log(customer);

    const user = await this.userRepository.create({
      ...data,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      stripeCustomerId: customer.id // Passando o stripeCustomerId
    });
    
    const token = this.fastify.jwt.sign({
      id: user?.id,
      email: user?.email,
    });

    return right({ user, token, customer });
  }

  async login(data: UserLogin): Promise<loginResponse> {
    const user = await this.userRepository.findOne(data.email);

    if (!user) {
      return left(new RequiredParametersError("User not found"));
    }
    const isValidPassword = await verifyPassword(data.password, user.password);

    if (isValidPassword === false) {
      return left(new RequiredParametersError("Invalid password"));
    }

    const token = this.fastify.jwt.sign({
      id: user?.id,
      email: user?.email,
    });

    return right({
      user,
      token
    });
  }
}

export { AuthService };