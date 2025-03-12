import { Couple, User } from "@prisma/client";
import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { CreateUser, IUserRepository, UserLogin } from "../../interfaces/user.interface";
import { PrismaCoupleInvitesRepository } from "../../repositories/couple-invites-repository";
import { PrismaUserRepository } from "../../repositories/user-repository";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { createStripeCustomer } from "../../utils/stripe";
import { CoupleService } from "../coupleService/couple-service";

type UserResponse = {
  user: User | null;
  token: string;
  couple?: Couple;
}

type registerResponse = Either<RequiredParametersError, UserResponse>;
type registerWithInviteResponse = Either<RequiredParametersError, UserResponse>;
type loginResponse = Either<RequiredParametersError, UserResponse>;
type meResponse = Either<RequiredParametersError, UserResponse>;

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

    const user = await this.userRepository.create({
      ...data,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      stripeCustomerId: customer.id
    });

    const token = this.fastify.jwt.sign({
      id: user?.id,
      email: user?.email,
    });

    return right({ user, token, customer });
  }

  async registerWithInvite(data: CreateUser & { inviteToken: string }): Promise<registerWithInviteResponse> {
    const { name, email, password, inviteToken } = data;

    const coupleInviteRepository = new PrismaCoupleInvitesRepository();
    const invite = await coupleInviteRepository.findInviteByToken(inviteToken);
    if (!invite || invite.used || dayjs().isAfter(dayjs.unix(invite.expiresAt))) {
      return left(new RequiredParametersError("Invalid or expired invite token."));
    }

    if (invite.inviteeEmail !== email) {
      return left(new RequiredParametersError("Email does not match the invite email."));
    }

    const existingUser = await this.userRepository.findOne(email);
    if (existingUser) {
      return left(new RequiredParametersError("Email already in use."));
    }

    const hashedPassword = await hashPassword(password);
    const customer = await createStripeCustomer({ email, name });
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      stripeCustomerId: customer.id,
    });

    const token = this.fastify.jwt.sign({
      id: user?.id,
      email: user?.email,
    });

    const coupleService = new CoupleService(this.fastify);
    const acceptResult = await coupleService.acceptInvite(inviteToken, String(user?.id));
    if (acceptResult.isLeft()) {
      console.error(acceptResult.value.message);
    }

    const couple = acceptResult.isRight() ? acceptResult.value : undefined;

    return right({ user, token, couple });
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
