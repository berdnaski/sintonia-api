import { FastifyInstance } from 'fastify';
import { WebhookController } from '../controllers/webhook-controller';

export async function webhookRoutes(app: FastifyInstance) {
  const webhookController = new WebhookController();

  app.post(
    '/webhook',
    async (req, reply) => {
      await webhookController.handleWebhook(req, reply);
    }
  );
}
