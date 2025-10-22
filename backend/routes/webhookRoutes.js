// backend/routes/stripeWebhook.js
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is missing!');
}

function rawBodyHook(request, payload, done) {
  request.rawBody = payload;
  done(null, payload);
}

export default async function webhookRoutes(fastify) {
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    rawBodyHook
  );

  fastify.post('/stripe-webhook', async (request, reply) => {
    const signature = request.headers['stripe-signature'];
    let event;

    if (!fastify.stripe) {
      request.log.error('Stripe non initialisé !');
      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ received: false });
    }

    try {
      event = fastify.stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      request.log.warn(`Webhook signature check failed: ${err.message}`);
      return reply.status(StatusCodes.BAD_REQUEST).send({ received: false });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;

        if (!userId || !subscriptionId) {
          request.log.warn(`[WEBHOOK] Données manquantes.`);
          return reply
            .status(StatusCodes.BAD_REQUEST)
            .send({ received: false });
        }

        try {
          await fastify.prisma.user.update({
            where: { id: userId },
            data: { plan: 'PREMIUM', stripeSubscriptionId: subscriptionId },
          });
          request.log.info(`✅ User ${userId} upgraded to PREMIUM.`);
        } catch (err) {
          request.log.error(`DB update failed: ${err.message}`);
          return reply
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send({ received: false });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        request.log.info(`Subscription canceled: ${subscription.id}`);
        break;
      }

      default:
        request.log.info(`Unhandled Stripe event: ${event.type}`);
    }

    reply.status(StatusCodes.OK).send({ received: true });
  });
}
