import type { Challenge, ChallengeTypeAnswer, Question } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { left, right, type Either } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { IChallengeRepository } from "../../interfaces/challenge-interface";
import { IUpdateQuestion } from "../../interfaces/question.interface";
import { GenerateDailyQuestion } from "../../providers/ai/functions/generateDailyQuestion";
import { PrismaChallengeRepository } from "../../repositories/challenge-repository";
import { GenerateWeeklyChallenge } from "../../providers/ai/functions/generateWeeklyChallenge";

type generateChallengeResponse = Either<RequiredParametersError, Challenge>
type saveChallengeResponse = Either<RequiredParametersError, Challenge>;

type getChallengeByIdResponse = Either<RequiredParametersError, Challenge | null>;
type getAllChallengeResponse = Either<RequiredParametersError, Challenge[]>;
type existsChallengeResponse = Either<RequiredParametersError, boolean>;
type removeChallengeResponse = Either<RequiredParametersError, Challenge>;

export class ChallengeService {
  private challengeRepository: IChallengeRepository;

  constructor(fastify: FastifyInstance) {
    this.challengeRepository = new PrismaChallengeRepository();
  }

  async generateChallenge(userId: string, coupleId: string): Promise<generateChallengeResponse> {
    const answer = await GenerateWeeklyChallenge({ userId, coupleId });

    const result = await this.challengeRepository.create({
      coupleId,
      userId,
      challenge: answer.response.challenge
    });

    return right(result);
  }

  async getAllChallenges(userId: string): Promise<getAllChallengeResponse> {
    const answer = await this.challengeRepository.findAll(userId);
    return right(answer);
  }

  async save(id: string, answer: ChallengeTypeAnswer): Promise<saveChallengeResponse> {
    const question = await this.challengeRepository.findOne(id);

    if (!question) {
      return left(new RequiredParametersError('Question not found'));
    }

    const updateChallenge = await this.challengeRepository.save(id, answer);

    return right(updateChallenge);
  }

  async findOne(ident: string): Promise<getChallengeByIdResponse> {
    const result = await this.challengeRepository.findOne(ident);

    return right(result);
  }

  async exists(ident: string): Promise<existsChallengeResponse> {
    const result = await this.challengeRepository.exists(ident);

    return right(result);
  }

  async remove(id: string): Promise<removeChallengeResponse> {
    const question = await this.challengeRepository.findOne(id);

    if (!question) {
      return left(new RequiredParametersError('Question not found'));
    }

    const result = await this.challengeRepository.remove(id);

    return right(result);
  }
}
