import { FastifyReply, FastifyRequest } from 'fastify';
import Stripe from 'stripe';
import { handleCancelPlan, handleCheckoutSessionCompleted, handleSubscriptionSessionCompleted } from '../utils/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET as string);

export class WebhookController {
  private async verifyStripeSignature(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;
    let event;

    try {
      const bodyBuffer = req.rawBody;

      if (!bodyBuffer) {
        console.error('Raw body is missing');
        return reply.status(400).send('Raw body is missing');
      }

      console.log('Stripe Signature:', signature);
      console.log('Raw Body:', bodyBuffer);

      event = stripe.webhooks.constructEvent(
        bodyBuffer,
        signature,
        process.env.STRIPE_ID_WEBHOOK as string
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return reply.status(400).send('Webhook signature verification failed');
    }

    await this.handleWebhookEvent(event, reply);
  }

  private async handleWebhookEvent(event: any, reply: FastifyReply) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionSessionCompleted(event);
          break;
        case 'customer.subscription.deleted':
          await handleCancelPlan(event);
          break;
        case 'customer.created':
          console.log('Customer created event:', event);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
          return reply.status(400).send(`Unhandled event type ${event.type}`);
      }

      reply.status(200).send();  
    } catch (err) {
      console.error('Webhook Error:', err);
      reply.status(500).send('Webhook error occurred');
    }
  }

  public async handleWebhook(req: FastifyRequest, reply: FastifyReply) {
    await this.verifyStripeSignature(req, reply);
  }
}
