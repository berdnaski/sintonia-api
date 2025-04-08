import { CoupleInvite } from "@prisma/client";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { ICoupleInviteRepository } from "../../interfaces/couple-invite.interface";
import { PrismaCoupleInvitesRepository } from "../../repositories/couple-invites-repository";

type createCoupleInviteResponse = Either<RequiredParametersError, CoupleInvite>;
type updateCoupleInviteResponse = Either<RequiredParametersError, CoupleInvite>;
type getCoupleInviteByIdResponse = Either<RequiredParametersError, CoupleInvite | null>;
type deleteCoupleInviteResponse = Either<RequiredParametersError, void>;
type CoupleInviteExistsResponse = Either<RequiredParametersError, boolean>;
type saveCoupleInviteResponse = Either<RequiredParametersError, void>;

class CoupleInviteService {
  private coupleInviteRepository: ICoupleInviteRepository;

  constructor() {
    this.coupleInviteRepository = new PrismaCoupleInvitesRepository();
  }

  async createCouple(coupleInvite: CoupleInvite): Promise<createCoupleInviteResponse> {
    const result = await this.coupleInviteRepository.create(coupleInvite);
    return right(result);
  }

  async updateCoupleInvite(id: string, updateData: Partial<CoupleInvite>): Promise<updateCoupleInviteResponse> {
    const coupleInvite = await this.coupleInviteRepository.getById(id);
    if (!coupleInvite) {
      return left(new RequiredParametersError("Couple Invite not found"));
    }

    const updatedCoupleInvite = { ...coupleInvite, ...updateData };
    await this.coupleInviteRepository.save(updatedCoupleInvite);
    return right(updatedCoupleInvite);
  }

  async getCoupleInviteById(id: string): Promise<getCoupleInviteByIdResponse> {
    const result = await this.coupleInviteRepository.getById(id);
    return right(result);
  }

  async getCoupleInviteByToken(token: string): Promise<getCoupleInviteByIdResponse> {
    const result = await this.coupleInviteRepository.findInviteByToken(token);
    return right(result);
  }

  async deleteCoupleInvite(id: string): Promise<deleteCoupleInviteResponse> {
    const coupleInvite = await this.coupleInviteRepository.getById(id);
    if (!coupleInvite) {
      return left(new RequiredParametersError("Couple Invite not found"));
    }

    const result = await this.coupleInviteRepository.remove(id);
    return right(result);
  }

  async CoupleInviteExists(id: string): Promise<CoupleInviteExistsResponse> {
    const result = await this.coupleInviteRepository.exists(id);
    return right(result);
  }

  async saveCoupleInvite(coupleInvite: CoupleInvite): Promise<saveCoupleInviteResponse> {
    const result = await this.coupleInviteRepository.save(coupleInvite);
    return right(result);
  }

  async findInviteByInviterId(userId: string): Promise<getCoupleInviteByIdResponse> {
    const result = await this.coupleInviteRepository.findInviteByInviterId(userId);

    return right(result);
  }
}

export { CoupleInviteService };
