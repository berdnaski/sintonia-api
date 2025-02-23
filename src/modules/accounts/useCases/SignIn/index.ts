import { PrismaUserRepository } from "modules/accounts/repositories/implementations/PrismaUsersRepository";
import { app } from "server";
import { SignInUseCase } from "./SignIn";
import { SignInController } from "./SignInController";
import { Controller } from "core/infra/Controller";

export function makeSignInController(): Controller {
  const prismaUsersRepository = new PrismaUserRepository();
  const signIn = new SignInUseCase(prismaUsersRepository);
  const controller = new SignInController(signIn)

  return controller
}