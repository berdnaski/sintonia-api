import { ParametersErrors } from "core/domain/errors/ParameterErrors";
import { Either, left, right } from "core/logic/Either";

export class Email {
  private readonly email: string;

  constructor(email: string) {
    this.email = email
  }

  get value(): string {
    return this.email
  }

  static validate(email: string): boolean {
    if (!email || email.trim().length > 255) {
      return false
    }

    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (!regex.test(email)) {
      return false
    }

    return true
  }

  static format(email: string) {
    return email.trim().toLowerCase()
  }

  static create(email: string): Either<ParametersErrors, Email> {
    if (!this.validate(email)) {
      return left(new ParametersErrors('Invalid email', 400))
    }

    const formattedEmail = this.format(email)

    return right(new Email(formattedEmail))
  }
}