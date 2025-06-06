import { User } from "@prisma/client";
import z from 'zod';

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  subscriptionStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
  stripeCustomerId?: string;
}

export const CreateUser = z.object({
  name: z.string().min(3, 'Name must have at least 3 characters').max(20, 'Name should not exceed 20 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must have at least 6 characters').max(255, 'Password should not exceed 255 characters'),
  stripeCustomerId: z.string().optional(),
});

export const CreateUserWithInvite = CreateUser.omit({ email: true})

export type CreateUser = z.infer<typeof CreateUser>;
export type CreateUserWithInvite = z.infer<typeof CreateUserWithInvite>;

export interface UserResponse {
  users: User[];
}

export const UserLogin = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must have at least 6 characters').max(255, 'Password should not exceed 255 characters'),
});
export type UserLogin = z.infer<typeof UserLogin>;

export type UserUpdate = Partial<Omit<User, 'id' | 'createdAt'>>

export interface IUserRepository {
  create(user: CreateUser): Promise<User | null>;
  exists(ident: string): Promise<boolean>;
  save(id: string, updateData: UserUpdate): Promise<User>;
  findOne(ident: string): Promise<User>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<User>;
  saveMany(userIds: string[], data: UserUpdate): Promise<void>
}
