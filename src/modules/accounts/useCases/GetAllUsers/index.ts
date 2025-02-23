import { Controller } from "core/infra/Controller";
import { GetAllUsersData } from "./GetAllUsers";
import { GetAllUsersController } from "./GetAllUsersController";
import { PrismaUserRepository } from "modules/accounts/repositories/implementations/PrismaUsersRepository";

export function makeGetAllUsersController(): Controller {
  const usersRepository = new PrismaUserRepository();
  const getAllUsers = new GetAllUsersData(usersRepository);
  const controller = new GetAllUsersController(getAllUsers)

  return controller
}