import { Tokens } from "@prisma/client";

export interface IToken {
  id?: string,
  type?: string,
  user_id?: string
  used?: boolean,
  createdAt?: Date,
  expiresIn?: number,
}

export interface CreateToken {
  type: string,
  user_id: string
  used: boolean
  expiresIn: number
}


export interface TokensResponse {
  tokens: Tokens[];
}

export interface TokenUpdate {
  type?: string;
  user_id?: string;
  used?: boolean;
  expiresIn?: number;
}

export interface ITokensRepository {
  create(tokens: Tokens): Promise<Tokens>
  save(tokens: Tokens): Promise<void>
  getById(id: string): Promise<Tokens | null>;
  exists(id: string): Promise<boolean>;
  remove(id: string): Promise<void>;
  saveSingle(token: Tokens): Promise<void>;
  findByTypeAndUserIdAndUsed(type: string, userId: string, used: boolean): Promise<Tokens[]>;
}