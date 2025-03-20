import type { Signal } from "@prisma/client";
import { z } from "zod";
import { CreateUser } from "./user.interface";

export interface ISignal {
  id: string;
  userId: string;
  coupleId: string;
  emotion: string;
  note: string | null;
  createdAt: Date;
}

export interface ICreateSignal {
  userId: string;
  coupleId: string;
  emotion: string;
  note: string;
}

export const CreateSignal = z.object({
  userId: z.string(),
  coupleId: z.string(),
  emotion: z.string(),
  note: z.string().min(1, 'Note must have at least 1 characters').max(400, 'Note not have more than 400 characters.'),
})
export type CreateSignal = z.infer<typeof CreateSignal>;

export interface ISignalResponse {
  signals: ISignal[];
}

export interface ISignalUpdate {
  emotion: string;
  note: string | null;
}

export interface ISignalRepository {
  create(signal: ICreateSignal): Promise<Signal>;
  save(id: string, updateData: ISignalUpdate): Promise<Signal>;
  findOne(ident: string): Promise<Signal>;
  findAll(): Promise<Signal[]>;
  exists(ident: string): Promise<boolean>;
  remove(id: string): Promise<Signal>
  findByCoupleId(coupleId: string): Promise<Signal[]>
}