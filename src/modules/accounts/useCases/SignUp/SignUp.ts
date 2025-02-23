import { SintoniAPI } from "config/sintonia.api";
import { FastifyInstance } from "fastify";
import JWT from 'jsonwebtoken';
import { Email } from "modules/accounts/entities/email";
import { Password } from "modules/accounts/entities/password";
import { ParametersErrors } from "../../../../core/domain/errors/ParameterErrors";
import { Either, left, right } from "../../../../core/logic/Either";
import { User } from "../../entities/User";
import { IUsersRepository } from "../../repositories/IUserRepository";
import { SignUpRequest } from "./SignUpDTO";

type TokenResponse = {
  token: string;
};

type SignUpResponse = Either<ParametersErrors, TokenResponse>

export class SignUpUseCase {
  constructor(
    private userRepository: IUsersRepository,
  ) { }

  async execute({ name, email, password }: SignUpRequest): Promise<SignUpResponse> {
    const emailOrError = Email.create(email);
    const passwordOrError = Password.create(password);

    if (!name || name.length < 3) {
      return left(new ParametersErrors("Invalid name.", 400));
    }

    if (emailOrError.isLeft()) {
      return left(emailOrError.value);
    }

    if (passwordOrError.isLeft()) {
      return left(passwordOrError.value);
    }

    const accountOrErr = User.create({
      name,
      email: emailOrError.value,
      password: passwordOrError.value,
    });

    if (accountOrErr.isLeft()) {
      return left(accountOrErr.value);
    }

    const account = accountOrErr.value;

    const emailAleardyExists = await this.userRepository.exists(account.email.value);
    if (emailAleardyExists) {
      return left(new ParametersErrors("This Email already already exist.", 409));
    }

    await this.userRepository.create(account);
    const token = JWT.sign({
      id: account.id, email: account.email
    }, SintoniAPI.secretKey, {
      expiresIn: '1d'
    })

    return right({ token });
  }
}
