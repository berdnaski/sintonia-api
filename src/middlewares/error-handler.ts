import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/app-error";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: "error",
      message: error.message
    });
  }

  console.error("Erro interno:", error);

  return reply.status(500).send({
    status: "error",
    message: "Erro interno do servidor"
  });
}