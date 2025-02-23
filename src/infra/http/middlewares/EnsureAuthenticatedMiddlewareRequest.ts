import { SintoniAPI } from "config/sintonia.api";
import type { FastifyReply, FastifyRequest } from "fastify";
import JWT from 'jsonwebtoken';

export const EnsureAuthenticatedMiddlewareRequest = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const token = request.headers.authorization?.split(' ')[1]

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  try {
    // request.jwtVerify();
    JWT.verify(token, SintoniAPI.secretKey);
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}