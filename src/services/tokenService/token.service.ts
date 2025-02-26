import { Tokens } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { ITokensRepository } from "../../interfaces/token.interface";
import { PrismaTokensRepository } from "../../repositories/tokens-repository";

class TokensService {
  private tokensRepository: ITokensRepository;

  constructor() {
    this.tokensRepository = new PrismaTokensRepository();
  }

  async createToken(token: Tokens): Promise<Tokens> {
    return await this.tokensRepository.create(token);
  }

  async updateToken(id: string, updateData: Partial<Tokens>): Promise<Tokens> {
    const token = await this.tokensRepository.getById(id);
    if (!token) {
      throw new Error("Token not found");
    }

    const updatedToken = { ...token, ...updateData };
    await this.tokensRepository.save(updatedToken);
    return updatedToken;
  }

  async getTokenById(id: string): Promise<Tokens | null> {
    return await this.tokensRepository.getById(id);
  }

  async deleteToken(id: string): Promise<void> {
    const token = await this.tokensRepository.getById(id);
    if (!token) {
      throw new Error("Token not found");
    }

    await this.tokensRepository.remove(id);
  }

  async findTokensByTypeAndUserIdAndUsed(
    type: string,
    userId: string,
    used: boolean
  ): Promise<Tokens[]> {
    return await this.tokensRepository.findByTypeAndUserIdAndUsed(type, userId, used);
  }

  async tokenExists(id: string): Promise<boolean> {
    return await this.tokensRepository.exists(id);
  }

  async saveToken(token: Tokens): Promise<void> {
    await this.tokensRepository.save(token);
  }
}

export { TokensService };