import { Controller } from "core/infra/Controller";
import { clientError, HttpResponse, ok } from "core/infra/HttpResponse";
import { GetAllUsersData } from "./GetAllUsers";

export class GetAllUsersController implements Controller {
  constructor(private getAllUsersData: GetAllUsersData) { }

  async handle(): Promise<HttpResponse> {
    const result = await this.getAllUsersData.execute();

    if (result.isLeft()) {
      const error = result.value;
      return clientError(error);
    } else {
      const users = result.value.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email.value,
        coupleId: user.coupleId,
        createdAt: user.createdAt,
      }));

      return ok(users);
    }
  }
} 