import bcrypt from 'bcryptjs';
import { SintoniAPI } from "config/sintonia.api";
import { FastifyInstance } from "fastify";
import JWT from 'jsonwebtoken';
import { ParametersErrors } from "../../../../core/domain/errors/ParameterErrors";
import { Either, left, right } from "../../../../core/logic/Either";
import { IUsersRepository } from "../../repositories/IUserRepository";
import { SignInRequest } from "./SignInDTO";

type TokenResponse = {
  token: string;
};

type SignInResponse = Either<ParametersErrors, TokenResponse>

export class SignInUseCase {
  constructor(
    private userRepository: IUsersRepository,
  ) { }

  async execute({ email, password }: SignInRequest): Promise<SignInResponse> {
    const account = await this.userRepository.findOne(email);
    if (!account) {
      return left(new ParametersErrors('Account not exists', 404))
    }

    const isPasswordValid = bcrypt.compareSync(password, String(account.password))
    // const isPasswordValid = await account.password.comparePassword(password)
    if (isPasswordValid === false) {
      return left(new ParametersErrors('Invalid password', 400))
    }

    const token = JWT.sign({
      id: account.id, email: account.email
    }, SintoniAPI.secretKey, {
      expiresIn: '1d'
    })

    return right({ token });
  }
}
