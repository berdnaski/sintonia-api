import { FastifyReply, FastifyRequest } from "fastify";

export const Auth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Invalid or missing Authorization header' });
  }

  try {
    const payload = await request.jwtVerify();
    request.user = payload
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
};