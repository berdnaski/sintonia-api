import type { User } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/userService/user.service";

export const CheckSubscription = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await request.jwtVerify();
    const user = request.user as User;

    if (!user || typeof user !== 'object' || !user.id) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid token payload'
      })
    }

    const userService = new UserService(request.server);

    const result = await userService.findOne(user.id);

    if (result.isLeft()) {
      return reply.send(404).send({
        error: 'Not found',
        message: 'User not found in database'
      });
    }

    const userFromDb = result.value;

    if (userFromDb.stripeSubscriptionStatus !== 'active') {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'You must have an active subscription'
      })
    }
  } catch (err) {
    reply.status(401).send({
      error: 'Unauthorized',
      message: err instanceof Error ? err.message : 'An error occurred during authentication.'
    })
  }
}
