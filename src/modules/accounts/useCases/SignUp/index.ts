import { Controller } from "core/infra/Controller";
import { PrismaUserRepository } from "modules/accounts/repositories/implementations/PrismaUsersRepository";
import { app } from "server";
import { SignUpUseCase } from "./SignUp";
import { SignUpController } from "./SignUpController";

export function makeSignUpController(): Controller {
  const prismaUsersRepository = new PrismaUserRepository();
  const signUp = new SignUpUseCase(prismaUsersRepository);
  const controller = new SignUpController(signUp)

  return controller
}