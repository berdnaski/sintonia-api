import { User } from "../entities/User";

export interface IUsersRepository {
  create(user: User): Promise<void>;
  exists(ident: string): Promise<boolean>;
  save(user: User): Promise<void>;
  findOne(ident: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}