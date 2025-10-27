import { StatusCodes } from 'http-status-codes';

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_FREE_COLLABORATORS = 5;

export default async function tasklistShareRoutes(fastify, options) {
  // Route pour ajouter un collaborateur à une liste
  fastify.route({
    method: 'POST',
    url: '/tasklists/:listId/share',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { listId } = request.params;
      const { collaboratorUserName } = request.body; // Supposons que le frontend envoie le nom d'utilisateur
      const userId = request.user.userId;

      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return reply
          .status(StatusCodes.NOT_FOUND)
          .send({ message: 'Utilisateur introuvable.' });
      }

      // 1. VÉRIFICATION DU PLAN / ESSAI
      const isPremium = user.plan === 'PREMIUM';
      const isTrialActive =
        user.premiumTrialActivatedAt &&
        Date.now() - user.premiumTrialActivatedAt.getTime() < ONE_MONTH_IN_MS;

      const hasAccessToSharing = isPremium || isTrialActive;

      // Si l'utilisateur est FREE et n'a pas encore d'essai, activez l'essai
      if (user.plan === 'FREE' && !user.premiumTrialActivatedAt) {
        await fastify.prisma.user.update({
          where: { id: userId },
          data: { premiumTrialActivatedAt: new Date() },
        });
        // L'accès au partage est maintenant activé pour un mois.
      } else if (!hasAccessToSharing) {
        // L'essai est expiré ou n'a jamais été Premium
        return reply.status(StatusCodes.FORBIDDEN).send({
          message:
            'Fonctionnalité Premium requise. Votre essai est peut-être terminé.',
        });
      }

      // 2. VÉRIFICATION DE L'AUTORISATION ET DE LA LIMITE

      // a) Vérifier si l'utilisateur est bien le propriétaire de la liste (pour des raisons de sécurité)
      const taskList = await fastify.prisma.taskList.findUnique({
        where: { id: listId },
        include: {
          owner: true,
          sharedWithUsers: true, // Inclure les partages existants
        },
      });

      if (!taskList || taskList.ownerId !== userId) {
        return reply
          .status(StatusCodes.FORBIDDEN)
          .send({ message: 'Accès refusé ou liste introuvable.' });
      }

      // b) Vérifier la limite de 5 collaborateurs (pour le plan individuel)
      if (taskList.sharedWithUsers.length >= MAX_FREE_COLLABORATORS) {
        return reply.status(StatusCodes.BAD_REQUEST).send({
          message: `Vous avez atteint la limite de ${MAX_FREE_COLLABORATORS} collaborateurs pour le plan Premium individuel.`,
        });
      }

      // 3. TROUVER L'UTILISATEUR À INVITER
      const collaborator = await fastify.prisma.user.findUnique({
        where: { userName: collaboratorUserName },
      });

      if (!collaborator) {
        return reply
          .status(StatusCodes.NOT_FOUND)
          .send({ message: 'Collaborateur non trouvé.' });
      }

      if (collaborator.id === userId) {
        return reply
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: 'Vous ne pouvez pas vous ajouter vous-même.' });
      }

      // 4. CRÉER LE PARTAGE
      try {
        await fastify.prisma.taskListShare.create({
          data: {
            taskListId: listId,
            userId: collaborator.id,
            permissionLevel: 'EDIT', // Par défaut, on donne les droits d'édition
          },
        });

        reply
          .status(StatusCodes.CREATED)
          .send({ message: 'Collaborateur ajouté avec succès.' });
      } catch (error) {
        fastify.log.error(error);
        reply
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ message: "Erreur lors de l'ajout du collaborateur." });
      }
    },
  });
}
