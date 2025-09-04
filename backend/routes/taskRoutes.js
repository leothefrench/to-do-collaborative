export default async function taskRoutes(fastify, options) {
  // 🔹 Créer une tâche
  fastify.route({
    method: 'POST',
    url: '/tasks',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        // Vérifie que la taskList appartient bien à l'utilisateur
        const taskList = await fastify.prisma.taskList.findUnique({
          where: { id: request.body.taskListId },
        });

        if (!taskList || taskList.ownerId !== request.user.userId) {
          return reply
            .status(403)
            .send({ message: 'Accès interdit à cette liste de tâches' });
        }

        const task = await fastify.prisma.task.create({
          data: {
            title: request.body.title,
            description: request.body.description,
            status: request.body.status,
            dueDate: request.body.dueDate,
            priority: request.body.priority,
            taskListId: request.body.taskListId,
          },
        });

        reply.status(201).send(task);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la création de la tâche',
        });
      }
    },
  });

  // 🔹 Récupérer toutes les tâches de l’utilisateur (via ses TaskLists)
  fastify.route({
    method: 'GET',
    url: '/tasks',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const tasks = await fastify.prisma.task.findMany({
          where: {
            taskList: {
              ownerId: request.user.userId, // ✅ filtre par propriétaire
            },
          },
        });
        reply.status(200).send(tasks);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la récupération des tâches',
        });
      }
    },
  });

  // 🔹 Récupérer une tâche par ID
  fastify.route({
    method: 'GET',
    url: '/tasks/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const task = await fastify.prisma.task.findUnique({
          where: { id: request.params.id },
          include: { taskList: true },
        });

        if (!task || task.taskList.ownerId !== request.user.userId) {
          return reply
            .status(403)
            .send({ message: 'Accès interdit à cette tâche' });
        }

        reply.status(200).send(task);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la récupération de la tâche',
        });
      }
    },
  });

  // 🔹 Mettre à jour une tâche
  fastify.route({
    method: 'PATCH',
    url: '/tasks/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const task = await fastify.prisma.task.findUnique({
          where: { id: request.params.id },
          include: { taskList: true },
        });

        if (!task || task.taskList.ownerId !== request.user.userId) {
          return reply
            .status(403)
            .send({ message: 'Accès interdit à cette tâche' });
        }

        const updatedTask = await fastify.prisma.task.update({
          where: { id: request.params.id },
          data: request.body,
        });

        reply.status(200).send(updatedTask);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la mise à jour de la tâche',
        });
      }
    },
  });

  // 🔹 Supprimer une tâche
  fastify.route({
    method: 'DELETE',
    url: '/tasks/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const task = await fastify.prisma.task.findUnique({
          where: { id: request.params.id },
          include: { taskList: true },
        });

        if (!task || task.taskList.ownerId !== request.user.userId) {
          return reply
            .status(403)
            .send({ message: 'Accès interdit à cette tâche' });
        }

        const deleteTask = await fastify.prisma.task.delete({
          where: { id: request.params.id },
        });

        reply.send(deleteTask);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la suppression de la tâche',
        });
      }
    },
  });
}
