import type { User } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/userService/user.service";
import { CoupleService } from "../services/coupleService/couple-service";
import { emitWarning } from "process";

export const CheckSubscription = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const jwt = await request.jwtVerify<{
      id: string;
      email: string;
    }>();

    if (!jwt || typeof jwt !== 'object' || !jwt.id) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid token payload'
      })
    }

    const coupleService = new CoupleService(request.server);

    const couple = await coupleService.findByUserId(jwt.id);

    if (!couple.isLeft() && (couple.value.user1.stripeSubscriptionStatus === 'active' || couple.value.user2.stripeSubscriptionStatus === 'active')) {
      return;
    }

    const userService = new UserService(request.server);

    const user = await userService.findOne(jwt.id);

    if (user.isLeft()) {
      return reply.send(404).send({
        error: 'Not found',
        message: 'User not found in database'
      });
    }

    if (user.value.stripeSubscriptionStatus !== 'active') {
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
