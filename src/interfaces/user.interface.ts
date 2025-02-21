import { User } from "@prisma/client";

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface UserResponse {
  users: User[];
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  avatarUrl?: string;
}

export interface UserRepository {
  create(data: CreateUser): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<User>;
  update(id: string, data: UserUpdate): Promise<User>;
}