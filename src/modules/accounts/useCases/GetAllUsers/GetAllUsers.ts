import { ParametersErrors } from "core/domain/errors/ParameterErrors";
import { Either, right } from "core/logic/Either";
import { User } from "modules/accounts/entities/User";
import { IUsersRepository } from "modules/accounts/repositories/IUserRepository";

type GetAllUsersResponse = Either<ParametersErrors, User[]>

export class GetAllUsersData {
  constructor(
    private userRepository: IUsersRepository,
  ) { }

  async execute(): Promise<GetAllUsersResponse> {
    const users = await this.userRepository.findAll();

    return right(users)
  }
}