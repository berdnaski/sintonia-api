import { CoupleInvite } from "@prisma/client";
import { ICoupleInviteRepository } from "../../interfaces/couple-invite.interface";
import { PrismaCoupleInvitesRepository } from "../../repositories/couple-invites-repository";

class CoupleInviteService {
  private coupleInviteRepository: ICoupleInviteRepository;

  constructor() {
    this.coupleInviteRepository = new PrismaCoupleInvitesRepository();
  }

  async createC(coupleInvite: CoupleInvite): Promise<CoupleInvite> {
    return await this.coupleInviteRepository.create(coupleInvite);
  }

  async updateCoupleInvite(id: string, updateData: Partial<CoupleInvite>): Promise<CoupleInvite> {
    const coupleInvite = await this.coupleInviteRepository.getById(id);
    if (!coupleInvite) {
      throw new Error("Couple Invite not found");
    }

    const updatedCoupleInvite = { ...coupleInvite, ...updateData };
    await this.coupleInviteRepository.save(updatedCoupleInvite);
    return updatedCoupleInvite;
  }

  async getCoupleInviteById(id: string): Promise<CoupleInvite | null> {
    return await this.coupleInviteRepository.getById(id);
  }

  async deleteCoupleInvite(id: string): Promise<void> {
    const coupleInvite = await this.coupleInviteRepository.getById(id);
    if (!coupleInvite) {
      throw new Error("Couple Invite not found");
    }

    await this.coupleInviteRepository.remove(id);
  }

  async CoupleInviteExists(id: string): Promise<boolean> {
    return await this.coupleInviteRepository.exists(id);
  }

  async saveCoupleInvite(coupleInvite: CoupleInvite): Promise<void> {
    await this.coupleInviteRepository.save(coupleInvite);
  }
}

export { CoupleInviteService };