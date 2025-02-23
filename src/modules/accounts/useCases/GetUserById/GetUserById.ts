import { ParametersErrors } from "core/domain/errors/ParameterErrors";
import { Either, left, right } from "core/logic/Either";
import { User } from "modules/accounts/entities/User";
import { IUsersRepository } from "modules/accounts/repositories/IUserRepository";
import { IGetUserByIdRequest } from "./GetUserByIdDTO";

type GetUserByIdResponse = Either<ParametersErrors, User>

export class GetUserById {
  constructor(
    private usersRepository: IUsersRepository
  ) { }

  async execute({ id }: IGetUserByIdRequest):Promise<GetUserByIdResponse> {
    const account = await this.usersRepository.findOne(id)

    if (!id || !account) {
      return left(new ParametersErrors('User not exists', 404))
    }

    return right(account)
  }
}