import { clientError, HttpResponse, ok } from "core/infra/HttpResponse";
import { SignInUseCase } from "./SignIn";
import { SignInRequest } from "./SignInDTO";
import { Controller } from "core/infra/Controller";

export class SignInController implements Controller {
  constructor(private signIn: SignInUseCase) { }

  async handle({ email, password }: SignInRequest): Promise<HttpResponse> {
    const result = await this.signIn.execute({ email, password })

    if (result.isLeft()) {
      const error = result.value;
      return clientError(error);
    } else {
      const { token } = result.value;
      return ok({ token });
    }
  }
} 