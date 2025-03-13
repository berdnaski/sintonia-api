import { CoupleInvite } from "@prisma/client";

export interface ICoupleInvite {
  id?: string,
  inviterId: string,
  inviteeEmail: string,
  token?: string,
  expiresIn?: number,
  used?: boolean,
  createdAt?: Date,
}

export interface CreateCoupleInvite {
  id?: string,
  inviterId: string,
  inviteeEmail: string,
  token: string,
  expiresIn: number,
}


export interface CoupleInvitesResponse {
  coupleInvites: CoupleInvite[];
}

export interface CoupleInviteUpdate {
  id?: string,
  inviterId?: string,
  inviteeEmail?: string,
  token?: string,
  expiresIn?: number,
  used?: boolean,
  createdAt?: Date,
}

export interface ICoupleInviteRepository {
  create(coupleInvite: CoupleInvite): Promise<CoupleInvite>
  save(coupleInvite: CoupleInvite): Promise<void>
  getById(id: string): Promise<CoupleInvite | null>;
  exists(id: string): Promise<boolean>;
  remove(id: string): Promise<void>;
  saveSingle(token: CoupleInvite): Promise<void>;
  findInviteByToken(token: string): Promise<CoupleInvite | null>
  findInviteByInviteeEmail(email: string): Promise<CoupleInvite | null>
  findInviteByInviterId(inviterId: string): Promise<CoupleInvite | null>
}
