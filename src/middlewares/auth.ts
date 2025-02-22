import type { FastifyReply, FastifyRequest } from "fastify";

export const Auth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const token = request.headers.authorization?.split(' ')[1]

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  try {
    request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}