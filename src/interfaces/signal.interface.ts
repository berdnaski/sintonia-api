import type { Signal } from "@prisma/client";

export interface ISignal {
  id: string;
  userId: string;
  coupleId: string;
  emotion: string;
  note: string | null;
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
  create(signal: ICreateSignal): Promise<Signal>;
  save(id: string, updateData: ISignalUpdate): Promise<Signal>;
  findOne(ident: string): Promise<Signal>;
  findAll(): Promise<Signal[]>;
  exists(ident: string): Promise<boolean>;
  remove(id: string): Promise<Signal>
}