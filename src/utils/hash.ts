import { hash, compare } from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash);
}