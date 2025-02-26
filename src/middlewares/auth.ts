import { FastifyReply, FastifyRequest } from "fastify";

export const Auth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Invalid or missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return reply.status(401).send({ error: 'Token not provided' });
  }

  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
};