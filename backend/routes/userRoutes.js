export default async function userRoutes(fastify, options) {
  fastify.route({
    method: 'POST',
    url: '/users',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const user = await fastify.prisma.user.create({
          data: request.body,
        });
        reply.status(201).send(user);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: "Erreur lors de la création de l'utilisateur",
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/users',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const users = await fastify.prisma.user.findMany();
        reply.send(users);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la récupérationd de utilisateurs',
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/users/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const user = await fastify.prisma.user.findUnique({
          where: {
            id: request.params.id,
          },
        });

        if (!user) {
          return reply.status(404).send({ message: 'Utilisateur non trouvé' });
        }
        reply.send(user);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: "Erreur lors de la récupération de l'utilisateur",
        });
      }
    },
  });

  // Ajoutez la nouvelle route pour la recherche d'utilisateurs
  fastify.get('/users/search', {
    handler: async (request, reply) => {
      const { q } = request.query;

  if (!q) {
      return reply.status(400).send({ message: 'Le terme de recherche est manquant.' });
    }

    // Convertir la requête en minuscules pour la recherche
    const searchTerm = q.toLowerCase();

    try {
      const users = await fastify.prisma.user.findMany({
        where: {
          OR: [
            {
              // Assurez-vous d'utiliser 'userName' et non 'name'
              userName: {
                contains: searchTerm,
              },
            },
            {
              email: {
                contains: searchTerm,
              },
            },
          ],
        },
        select: {
          id: true,
          userName: true,
          email: true,
        },
        take: 10,
      });

      reply.send(users);

    } catch (error) {
      request.log.error(error);
      reply.status(500).send({
        message: 'Échec de la recherche des utilisateurs.',
      });
    }
  },
  });

  fastify.route({
    method: 'PUT',
    url: '/users/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const updateUser = await fastify.prisma.user.update({
          where: {
            id: request.params.id,
          },
          data: request.body,
        });
        reply.send(updateUser);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: "Erreur lors de la mise à jour de l'utilisateur",
        });
      }
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/users/:id',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const deleteUser = await fastify.prisma.user.delete({
          where: {
            id: request.params.id,
          },
        });
        reply.send(deleteUser);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: "Erreur lors de la suppression de l'utilisateur",
        });
      }
    },
  });
}
