import type { Signal } from "@prisma/client";

export interface ISignal {
  id: string;
  userId: string;
  coupleId: string;
  emotion: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSignal {
  userId: string;
  coupleId: string;
  emotion: string;
  note: string | null; 
}

export interface ISignalResponse {
  signals: ISignal[];
}

export interface ISignalUpdate {
  emotion: string;
  note: string | null;
}

export interface ISignalRepository {
  create(signal: ISignal): Promise<ICreateSignal | null>;
  save(id: string, updateData: ISignalUpdate): Promise<Signal>;
  findOne(ident: string): Promise<Signal>;
  findAll(): Promise<Signal[]>
  exists(ident: string): Promise<boolean>;
  remove(id: string): Promise<Signal>
}