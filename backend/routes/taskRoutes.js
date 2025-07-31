export default async function taskRoutes(fastify, options) {
  fastify.route({
    method: 'POST',
    url: '/task',
    handler: async (request, reply) => {
      try {
        const task = await fastify.prisma.task.create({
          data: request.body,
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

  fastify.route({
    method: 'GET',
    url: '/task',
    handler: async (request, reply) => {
      try {
        const task = await fastify.prisma.task.findMany();
        reply.status(200).send(task);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la récupération de la tâche',
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/task/:id',
    handler: async (request, reply) => {
      try {
        const task = await fastify.prisma.task.findUnique({
          where: {
            id: request.params.id,
          },
        });
        if (!task) {
          return reply
            .status(404)
            .send({ message: 'Tâche non trouvée' });
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

  fastify.route({
    method: 'PATCH',
    url: '/task/:id',
    handler: async (request, reply) => {
      try {
        const updatedTask = await fastify.prisma.task.update({
          where: {
            id: request.params.id,
          },
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

  fastify.route({
    method: 'DELETE',
    url: '/task/:id',
    handler: async (request, reply) => {
      try {
        const deleteTask = await fastify.prisma.task.delete({
          where: {
            id: request.params.id,
          },
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
 