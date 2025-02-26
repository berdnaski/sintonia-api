import { FastifyReply, FastifyRequest } from "fastify";
import { User } from '@prisma/client';

export const Auth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    await request.jwtVerify();

    const user = request.user as User;

    if (!user || typeof user !== 'object' || !user.id) {
      throw new Error('Invalid token payload');
    }
    console.log("User authenticated:", user);

  } catch (err) {
    reply.status(401).send({
      error: 'Unauthorized',
      message: err instanceof Error ? err.message : 'An error occurred during authentication',
    });
  }
};
