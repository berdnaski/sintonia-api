
import { Entity } from "core/domain/Entity";
import { ParametersErrors } from "core/domain/errors/ParameterErrors";
import { Either, right } from "core/logic/Either";
import { User } from "./User";

export interface ICoupleProps {
  createdAt: Date;
  updatedAt: Date;
  users: User[];
}

export class Couple extends Entity<ICoupleProps> {
  constructor(props: ICoupleProps, id?: string) {
    super(props, id);
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get users() {
    return this.props.users;
  }

  static create(props: ICoupleProps, id?: string): Either<ParametersErrors, Couple> {
    const couple = new Couple({
      ...props,
    }, id);

    return right(couple);
  }
}