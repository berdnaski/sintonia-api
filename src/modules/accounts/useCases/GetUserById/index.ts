import { PrismaUserRepository } from "modules/accounts/repositories/implementations/PrismaUsersRepository";
import { GetUserById } from "./GetUserById";
import { GetUserByIdController } from "./GetUserByIdController";
import { Controller } from "core/infra/Controller";

export function makeGetUserByIdController(): Controller {
  const repository = new PrismaUserRepository()
  const getUserById = new GetUserById(repository)
  const controller = new GetUserByIdController(getUserById)
  
  return controller
}