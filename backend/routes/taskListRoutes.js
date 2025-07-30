export default async function taskListRoutes(fastify, options) {
    fastify.route({
        method: 'POST',
        url: '/tasklists',
        handler: async (request, reply) => {
            try {
                const taskList = await fastify.prisma.taskList.create({
                    data: request.body,
                })
                reply.status(201).send(taskList)
            } catch (error) {
                request.log.error(error)
                reply.status(500).send({
                    message: 'Erreur lors de la création de la liste de tâches',
                })
            }
        }
    })

    fastify.route({
        method: 'GET',
        url: '/tasklists',
        handler: async (request, reply) => {
            try {
                const taskLists = await fastify.prisma.taskList.findMany()
                reply.status(200).send(taskLists)
            } catch (error) {
                request.lor.error(error)
                reply.status(500).send({
                    message: 'Erreur lors de la récupération des listes de tâches',
                })
            }
        }
    })

    fastify.route({
        method: 'GET',
        url: '/tasklists/:id',
        handler: async (request, reply) => {
            try {
                const taskList = await fastify.prisma.taskList.findUnique({
                  where: {
                    id: request.params.id,
                  },
                });
                if (!taskList) {
                    return reply.status(404).send({ message: 'Liste de tâches non trouvée' })
                }
             reply.status(200).send(taskList)
            } catch (error) {
                request.log.error(error)
                reply.status(500).send({
                    message: 'Erreur lors de la récupération de la liste de tâches',
                })
            }
        }
    })

    fastify.route({
        method: 'PATCH',
        url: '/tasklists/:id',
        handler: async (request, reply) => {
            try {
                const updatedTaskList = await fastify.prisma.taskList.update({
                    where: {
                        id: request.params.id,
                    },
                    data: request.body,
                })
                reply.status(200).send(updatedTaskList);
            } catch (error) {
                request.log.error(error)
                reply.status(500).send({
                    message: 'Erreur lors de la mise à jour de la liste de tâches',
                })
                        
            }
        }
    })

  fastify.route({
    method: 'DELETE',
    url: '/tasklists/:id',
    handler: async (request, reply) => {
      try {
        const deleteTaskList = await fastify.prisma.taskList.delete({
          where: {
            id: request.params.id,
          },
        });
        reply.send(deleteTaskList);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: "Erreur lors de la suppression de la liste de tâches",
        });
      }
    },
  });
}