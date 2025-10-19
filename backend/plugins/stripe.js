import fp from 'fastify-plugin';
import Stripe from 'stripe';

export default fp(async function stripePlugin(fastify, opts) {
  // 1. Vérifie si la clé secrète est présente dans le .env
  if (!process.env.STRIPE_SECRET_KEY) {
    fastify.log.error(
      "STRIPE_SECRET_KEY non trouvé dans les variables d'environnement. Le service Stripe ne sera pas chargé."
    );
    return;
  }

  // 2. Initialise l'objet Stripe avec la clé secrète
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // Utiliser une version d'API stable pour éviter les problèmes de compatibilité
    apiVersion: '2020-08-27',
  });

  // 3. Décore l'objet Fastify, permettant d'appeler fastify.stripe dans les routes
  fastify.decorate('stripe', stripe);
});
