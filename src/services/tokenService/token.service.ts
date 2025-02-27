import { Tokens } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { ITokensRepository } from "../../interfaces/token.interface";
import { PrismaTokensRepository } from "../../repositories/tokens-repository";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";

type createTokenResponse = Either<RequiredParametersError, Tokens>
type updateTokenResponse = Either<RequiredParametersError, Tokens>
type getTokenByIdResponse = Either<RequiredParametersError, Tokens | null>
type deleteTokenResponse = Either<RequiredParametersError, string>
type findTokensByTypeAndUserIdAndUsedResponse = Either<RequiredParametersError, Tokens[]>
type tokenExistsResponse = Either<RequiredParametersError, boolean>
type saveTokenResponse = Either<RequiredParametersError, void>

class TokensService {
  private tokensRepository: ITokensRepository;

  constructor() {
    this.tokensRepository = new PrismaTokensRepository();
  }

  async createToken(token: Tokens): Promise<createTokenResponse> {
    const result = await this.tokensRepository.create(token);
    return right(result)
  }

  async updateToken(id: string, updateData: Partial<Tokens>): Promise<updateTokenResponse> {
    const token = await this.tokensRepository.getById(id);
    if (!token) {
      return left(new RequiredParametersError("Token not found"));
    }

    const updatedToken = { ...token, ...updateData };
    await this.tokensRepository.save(updatedToken);

    return right(updatedToken);
  }

  async getTokenById(id: string): Promise<getTokenByIdResponse> {
    const result = await this.tokensRepository.getById(id);
    return right(result)
  }

  async deleteToken(id: string): Promise<deleteTokenResponse> {
    const token = await this.tokensRepository.getById(id);
    if (!token) {
      return left(new RequiredParametersError("Token not found"))
    }

    await this.tokensRepository.remove(id);
    return right("Token deleted successfully");
  }

  async findTokensByTypeAndUserIdAndUsed(
    type: string,
    userId: string,
    used: boolean
  ): Promise<findTokensByTypeAndUserIdAndUsedResponse> {
    const result = await this.tokensRepository.findByTypeAndUserIdAndUsed(type, userId, used);
    return right(result)
  }

  async tokenExists(id: string): Promise<tokenExistsResponse> {
    const result = await this.tokensRepository.exists(id);
    return right(result)
  }

  async saveToken(token: Tokens): Promise<saveTokenResponse> {
    const result = await this.tokensRepository.save(token);
    return right(result)
  }
}

export { TokensService };