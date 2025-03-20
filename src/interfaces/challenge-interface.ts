import { Challenge, ChallengeTypeAnswer } from "@prisma/client";
import { z } from "zod";

export const validAnswers = ["Unsuccessfully", "Pending", "Completed"];

export interface IChallenge {
  id: string;
  userId: string;
  coupleId: string;
  challenge: string;
  answer: ChallengeTypeAnswer;
  createdAt: Date;
}

export interface ICreateChallenge {
  userId: string;
  coupleId: string;
  challenge: string;
}

export const CreateChallenge = z.object({
  userId: z.string(),
  coupleId: z.string(),
})
export type CreateChallenge = z.infer<typeof CreateChallenge>;

export interface IChallengeResponse {
  challenge: Challenge[];
}

export interface IChallengeRepository {
  create(challenge: ICreateChallenge): Promise<Challenge>;
  save(id: string, answer: ChallengeTypeAnswer): Promise<Challenge>;
  exists(ident: string): Promise<boolean>;
  remove(id: string): Promise<Challenge>
  findOne(ident: string): Promise<Challenge | null>;
  findAll(userId: string): Promise<Challenge[]>;
}