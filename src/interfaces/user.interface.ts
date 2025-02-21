import { User } from "@prisma/client";

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
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
}