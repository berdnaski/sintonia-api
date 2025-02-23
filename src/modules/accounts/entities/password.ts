import bcrypt from 'bcryptjs'
import { ParametersErrors } from "core/domain/errors/ParameterErrors"
import { Either, left, right } from "core/logic/Either"

export class Password {
  private readonly password: string
  private readonly hashed?: boolean

  constructor(password: string, hashed: boolean) {
    this.password = password
    this.hashed = hashed
  }

  static validate(password: string): boolean {
    if (!password || password.trim().length < 6 || password.trim().length > 255) {
      return false
    }
    return true
  }

  public async getHashedPassword(): Promise<string> {
    if (this.hashed) {
      return this.password
    }
    return await bcrypt.hash(this.password, 8)
  }

  // public async comparePassword(plainTextPassword: string): Promise<boolean> {
  //   let hashed: string;

  //   if (this.hashed) {
  //     hashed = this.password
  //     return await bcrypt.compare(plainTextPassword, hashed)
  //   }
  //   return this.password === plainTextPassword
  // }

  static create(password: string, hashed: boolean = false): Either<ParametersErrors, Password> {
    if (!hashed && !this.validate(password)) {
      return left(new ParametersErrors('Invalid Password', 400))
    }
    return right(new Password(password, hashed))
  }
}