export default async function taskListRoutes(fastify, options) {
  // 🔹 Créer une liste
  fastify.route({
    method: 'POST',
    url: '/tasklists',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      // ⭐ AJOUT 1 : Récupérer l'ID de l'utilisateur pour la réutilisation
      const userId = request.user.userId;
      // ⭐ AJOUT 2 : Constante pour définir la limite du plan gratuit
      const FREE_PLAN_LIMIT = 3;

      try {


        // 1. Récupérer le plan actuel de l'utilisateur (FREE, PREMIUM, etc.)
        const user = await fastify.prisma.user.findUnique({
          where: { id: userId },
          select: { plan: true },
        });

        if (!user) {
          return reply.status(404).send({ message: 'Utilisateur non trouvé.' });
        }

        // 2. Vérification de la limite si le plan est 'FREE'
        if (user.plan === 'FREE') {
          const listCount = await fastify.prisma.taskList.count({
            where: { ownerId: userId }, // Compte combien de listes l'utilisateur possède déjà
          });

          if (listCount >= FREE_PLAN_LIMIT) {
            // 3. BLOQUER : Renvoyer un statut 403 (Interdit)
            return reply.status(403).send({
              message: `Le plan gratuit est limité à ${FREE_PLAN_LIMIT} listes. Veuillez passer au Premium.`,
              errorCode: 'FREE_LIMIT', // Un code d'erreur utile pour le Frontend
            });
          }
        }

        const taskList = await fastify.prisma.taskList.create({
          data: {
            ...request.body,

            ownerId: userId,
          },
        });
        reply.status(201).send(taskList);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la création de la liste de tâches',
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/tasklists',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;

        const taskLists = await fastify.prisma.taskList.findMany({
          where: {
            OR: [
              { ownerId: userId },
              {
                sharedWithUsers: {
                  // MODIFIÉ : Utilise sharedWithUsers
                  some: { userId: userId }, // MODIFIÉ : Vérifie le userId dans la table de jointure
                },
              },
            ],
          },
          include: {
            owner: {
              select: {
                id: true,
                userName: true,
              },
            },
            sharedWithUsers: {
              // MODIFIÉ : Utilise sharedWithUsers
              select: {
                userId: true, // IMPORTANT : On sélectionne l'ID de l'utilisateur dans la table de jointure
                permissionLevel: true, // AJOUTÉ : Pour récupérer le niveau de permission
                user: {
                  // AJOUTÉ : Pour inclure les détails de l'utilisateur réel
                  select: {
                    id: true,
                    userName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        reply.status(200).send(taskLists);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la récupération des listes de tâches',
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/tasklists/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const taskList = await fastify.prisma.taskList.findUnique({
          where: { id: request.params.id },
        });

        if (!taskList || taskList.ownerId !== request.user.userId) {
          return reply
            .status(403)
            .send({ message: 'Accès interdit à cette liste' });
        }

        reply.status(200).send(taskList);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la récupération de la liste de tâches',
        });
      }
    },
  });

  // 🔹 Mettre à jour une liste
  fastify.route({
    method: 'PATCH',
    url: '/tasklists/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const existing = await fastify.prisma.taskList.findUnique({
          where: { id: request.params.id },
        });

        if (!existing || existing.ownerId !== request.user.userId) {
          return reply
            .status(403)
            .send({ message: 'Accès interdit à cette liste' });
        }

        const updatedTaskList = await fastify.prisma.taskList.update({
          where: { id: request.params.id },
          data: request.body,
        });

        reply.status(200).send(updatedTaskList);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la mise à jour de la liste de tâches',
        });
      }
    },
  });

  // 🔹 Supprimer une liste
  fastify.route({
    method: 'DELETE',
    url: '/tasklists/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const existing = await fastify.prisma.taskList.findUnique({
          where: { id: request.params.id },
        });

        if (!existing || existing.ownerId !== request.user.userId) {
          return reply
            .status(403)
            .send({ message: 'Accès interdit à cette liste' });
        }

        const deleteTaskList = await fastify.prisma.taskList.delete({
          where: { id: request.params.id },
        });

        reply.send(deleteTaskList);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la suppression de la liste de tâches',
        });
      }
    },
  });
}
