
import { prisma } from "../../database/prisma-client";
import { Either, left, right } from "../../errors/either";
import { createPortalCustomer, generateCheckout } from "../../utils/stripe";

export class CheckoutService {
  async createCheckout(userId: string): Promise<Either<Error, any>> {
    try {
      const user = await prisma.user.findFirst({ where: { id: userId } });

      if (!user) {
        return left(new Error("Usuário não encontrado"));
      }

      const checkout = await generateCheckout(user.id, user.email);
      return right(checkout);
    } catch (error) {
      return left(new Error("Erro ao criar checkout"));
    }
  }

  async createPortal(userId: string): Promise<Either<Error, any>> {
    try {
      const user = await prisma.user.findFirst({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          stripeCustomerId: true
        }
      });
      console.log('Found user:', user);
      if (!user) {
        return left(new Error("Usuário não encontrado"));
      }
      if (!user.stripeCustomerId) {
        return left(new Error("Usuário não possui assinatura ativa"));
      }
      const portal = await createPortalCustomer(user.stripeCustomerId);
      return right(portal);
    } catch (error: any) {
      console.error('Portal creation error:', error);
      return left(new Error(error.message || "Erro ao criar portal do cliente"));
    }
  }
}
