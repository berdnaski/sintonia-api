import { fail, HttpResponse, ok } from "core/infra/HttpResponse";
import { User } from "modules/accounts/entities/User";
import { GetUserById } from "./GetUserById";
import { IGetUserByIdRequest } from "./GetUserByIdDTO";
import { Controller } from "core/infra/Controller";

export class GetUserByIdController implements Controller {
  constructor(
    private getUserById: GetUserById
  ) { }

  async handle({ id }: IGetUserByIdRequest): Promise<HttpResponse> {
    const result = await this.getUserById.execute({ id })

    if (result.isLeft()) {
      const err = result.value
      return fail(err)
    } else {
      const Parse = result.value as User

      return ok({
        id: Parse.id,
        name: Parse.name,
        email: Parse.email.value,
        avatarUrl: Parse.avatarUrl,
        createdAt: Parse.createdAt,
        coupleId: Parse.coupleId,
      })
    }
  }
}