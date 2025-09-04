export default async function taskListRoutes(fastify, options) {
  // 🔹 Créer une liste
  fastify.route({
    method: 'POST',
    url: '/tasklists',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const taskList = await fastify.prisma.taskList.create({
          data: {
            ...request.body,
            ownerId: request.user.userId, // ✅ assignation au bon user
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

  // 🔹 Récupérer toutes les listes de l’utilisateur
  fastify.route({
    method: 'GET',
    url: '/tasklists',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const taskLists = await fastify.prisma.taskList.findMany({
          where: {
            ownerId: request.user.userId, // ✅ filtre par utilisateur
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

  // 🔹 Récupérer une liste par ID
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
