import { Controller } from "core/infra/Controller";
import { clientError, created, HttpResponse } from "core/infra/HttpResponse";
import { SignUpUseCase } from "./SignUp";
import { SignUpRequest } from "./SignUpDTO";

export class SignUpController implements Controller {
  constructor(private signUp: SignUpUseCase) { }

  async handle({ name, email, password }: SignUpRequest): Promise<HttpResponse> {
    const result = await this.signUp.execute({ name, email, password })

    if (result.isLeft()) {
      const error = result.value;
      return clientError(error);
    } else {
      const { token } = result.value;
      return created({ token });
    }
  }
} 