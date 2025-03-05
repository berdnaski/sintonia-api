import { FastifyReply, FastifyRequest } from "fastify";
import { CheckoutService } from "../services/checkoutService/checkout-service";

export class CheckoutController {
  private checkoutService: CheckoutService;

  constructor() {
    this.checkoutService = new CheckoutService();
  }

  async createCheckout(
    req: FastifyRequest<{ Params: { id: string }; Query: { email: string } }>, 
    reply: FastifyReply
  ) {
    const { id } = req.params;
    const { email } = req.query;  

    if (!email) {
      return reply.status(400).send({ message: "Email is required" });
    }

    const result = await this.checkoutService.createCheckout(id, email);

    if (result.isLeft()) {
      return reply.status(400).send({ message: result.value.message });
    }

    return reply.status(200).send(result.value); 
  }

  async createPortal(
    req: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    const { id } = req.params;

    const result = await this.checkoutService.createPortal(id);

    if (result.isLeft()) {
      return reply.status(400).send({ message: result.value.message });
    }

    return reply.status(200).send(result.value); 
  }
}
