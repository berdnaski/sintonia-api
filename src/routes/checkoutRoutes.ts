import type { FastifyInstance } from "fastify";
import { CheckoutController } from "../controllers/checkout-controller";

export async function checkoutRoutes(app: FastifyInstance) {
  const checkoutController = new CheckoutController();

  app.get("/checkout/:id", async (req, reply) => {
    await checkoutController.createCheckout(req, reply);
  })

  app.get("/portal/stripe/:id", async (req, reply) => {
    await checkoutController.createPortal(req, reply);
  })
}