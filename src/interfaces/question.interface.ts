import { Question } from "@prisma/client";
import { z } from "zod";
import { Paginate, PaginationParams } from "../@types/prisma";

export interface IQuestion {
  id: string;
  userId: string;
  coupleId: string;
  question: string;
  answer: string;
  wasAnswered: boolean;
  createdAt: Date;
}

export interface IUpdateQuestion {
  wasAnswered: boolean;
  answer: string
}

export interface ICreateQuestion {
  userId: string;
  coupleId: string;
  question: string;
}

export const CreateQuestion = z.object({
  userId: z.string(),
  coupleId: z.string(),
})
export type CreateQuestion = z.infer<typeof CreateQuestion>;

export interface IQuestionsResponse {
  questions: Question[];
}

export interface IQuestionsRepository {
  create(question: ICreateQuestion): Promise<Question>;
  save(id: string, updateData: IUpdateQuestion): Promise<Question>;
  exists(ident: string): Promise<boolean>;
  remove(id: string): Promise<Question>
  findOne(ident: string): Promise<Question | null>;
  findAll(userId: string, params: PaginationParams): Promise<Paginate<Question>>;
}
