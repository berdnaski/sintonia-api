import { Entity } from "core/domain/Entity";
import { ParametersErrors } from "core/domain/errors/ParameterErrors";
import { Either, right } from "core/logic/Either";
import { Couple } from "./Couple";
import { Email } from "./email";
import { Password } from "./password";

export interface IUserProps {
  name: string,
  email: Email,
  password: Password,
  avatarUrl?: string,
  coupleId?: string,
  createdAt?: Date,
  updatedAt?: Date,
  couple?: Couple,
}

export class User extends Entity<IUserProps> {
  private constructor(props: IUserProps, id?: string) {
    super(props, id);
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get couple() {
    return this.props.couple;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  set name(name: string) {
    this.props.name = name;
  }

  set password(password: Password) {
    this.props.password = password;
  }

  set coupleId(coupleId: string) {
    this.props.coupleId = coupleId;
  }

  static create(props: IUserProps, id?: string): Either<ParametersErrors, User> {
    const user = new User({
      ...props,
      // couple: props.couple ?? Couple.create([])
    }, id)
    return right(user)
  }
}