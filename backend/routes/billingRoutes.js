import { StatusCodes } from 'http-status-codes';

export default async function billingRoutes(fastify, options) {
  // ℹ️ Le Price ID doit être défini dans .env
  const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID;
  const FRONTEND_URL = 'http://localhost:3000'; // URL de votre frontend pour les redirections

  if (!PREMIUM_PRICE_ID) {
    fastify.log.warn(
      'STRIPE_PREMIUM_PRICE_ID manquant. Les routes de facturation sont désactivées.'
    );
    return;
  }

  // 🔹 Créer une session Stripe Checkout pour l'abonnement
  fastify.route({
    method: 'POST',
    url: '/subscribe',
    preHandler: [fastify.authenticate],
    schema: {
      // Schéma de validation simple (le corps est vide ici)
      response: {
        201: {
          type: 'object',
          properties: {
            url: { type: 'string' }, // Nous renvoyons l'URL de redirection
          },
        },
      },
    },
    handler: async (request, reply) => {
      // 1. L'utilisateur est authentifié par fastify.authenticate
      const userId = request.user.userId;

      try {
        // 2. Création de la session Checkout
        const session = await fastify.stripe.checkout.sessions.create({
          // Informations sur la facturation
          mode: 'subscription', // Mode abonnement
          payment_method_types: ['card'],

          // L'article que l'utilisateur achète
          line_items: [
            {
              price: PREMIUM_PRICE_ID, // Utilise l'ID du plan défini dans .env
              quantity: 1,
            },
          ],

          // Redirections après paiement (Stripe renvoie ici)
          // success_url: `${FRONTEND_URL}/profile?payment=success`,
          success_url: `${FRONTEND_URL}/tasks?payment=success`,
          cancel_url: `${FRONTEND_URL}/profile?payment=cancelled`,

          // Métadonnées importantes pour le Webhook (Étape 2)
          metadata: {
            userId: userId, // On stocke l'ID de l'utilisateur Fastify/Prisma
          },
        });

        // 3. Renvoi de l'URL de redirection au frontend
        reply.status(StatusCodes.CREATED).send({ url: session.url });
      } catch (error) {
        request.log.error(
          'Erreur lors de la création de la session Stripe:',
          error.message
        );
        reply
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ message: 'Échec de la connexion au service de paiement.' });
      }
    },
  });
}
