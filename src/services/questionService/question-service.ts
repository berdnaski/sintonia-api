import type { Question } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { left, right, type Either } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { IQuestionsRepository, IUpdateQuestion } from "../../interfaces/question.interface";
import { GenerateDailyQuestion } from "../../providers/ai/functions/generateDailyQuestion";
import { PrismaQuestionRepository } from "../../repositories/question-repository";
import { Paginate, PaginationData } from "../../@types/prisma";

type generateQuestionResponse = Either<RequiredParametersError, Question>
type saveQuestionResponse = Either<RequiredParametersError, Question>;

type getQuestionByIdResponse = Either<RequiredParametersError, Question | null>;
type getAllQuestionsResponse = Either<RequiredParametersError, Paginate<Question>>;
type existsQuestionResponse = Either<RequiredParametersError, boolean>;
type removeQuestionResponse = Either<RequiredParametersError, Question>;

export class QuestionService {
  private questionRepository: IQuestionsRepository;

  constructor(fastify: FastifyInstance) {
    this.questionRepository = new PrismaQuestionRepository();
  }

  async generateQuestion(userId: string, coupleId: string): Promise<generateQuestionResponse> {
    const answer = await GenerateDailyQuestion({ userId, coupleId });

    const result = await this.questionRepository.create({
      coupleId,
      userId,
      question: answer.response.question
    });

    return right(result);
  }

  async getAllQuestions(userId: string, params: PaginationData): Promise<getAllQuestionsResponse> {
    const answer = await this.questionRepository.findAll(userId, params);

    return right(answer);
  }

  async save(id: string, updateData: IUpdateQuestion): Promise<saveQuestionResponse> {
    const answer = await this.questionRepository.findOne(id);

    if (!answer) {
      return left(new RequiredParametersError('Question not found'));
    }

    const updatedQuestion = await this.questionRepository.save(id, updateData);

    return right(updatedQuestion);
  }

  async findOne(ident: string): Promise<getQuestionByIdResponse> {
    const result = await this.questionRepository.findOne(ident);

    return right(result);
  }

  async exists(ident: string): Promise<existsQuestionResponse> {
    const result = await this.questionRepository.exists(ident);

    return right(result);
  }

  async remove(id: string): Promise<removeQuestionResponse> {
    const question = await this.questionRepository.findOne(id);

    if (!question) {
      return left(new RequiredParametersError('Question not found'));
    }

    const result = await this.questionRepository.remove(id);

    return right(result);
  }
}
