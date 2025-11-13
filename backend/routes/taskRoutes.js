export default async function taskRoutes(fastify, options) {
  fastify.route({
    method: 'POST',
    url: '/tasks',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
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
            taskList: {
              connect: { id: request.body.taskListId }, // NOUVEAU
            },
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

  fastify.route({
    method: 'GET',
    url: '/tasks',
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = request.user.userId;

        // 1. Récupération des deux paramètres de filtre de l'URL
        const { taskListId, isFavorite } = request.query;

        // 2. Initialisation de la condition WHERE
        const whereCondition = {
          // Condition de sécurité de base : ne montrer que les tâches des listes
          // que l'utilisateur possède.
          // NOTE: Il faudrait étendre cette logique pour inclure les listes partagées plus tard.
          taskList: {
            ownerId: userId,
          },
        };

        // 3. Ajout du filtre par ID de liste SI le paramètre est présent
        if (taskListId) {
          // Ajouter la contrainte : la tâche DOIT appartenir à cette taskListId
          whereCondition.taskListId = taskListId;
        }

        // ⭐️ MODIFICATION ICI : Ajout du filtre par Favoris
        if (isFavorite === 'true') {
          whereCondition.isFavorite = true;
        }

        // 4. Exécution de la requête avec la condition WHERE dynamique
        const tasks = await fastify.prisma.task.findMany({
          where: whereCondition,
          orderBy: {
            createdAt: 'asc', // Optionnel : trier pour l'affichage
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

  fastify.route({
    method: 'PATCH',
    url: '/tasks/:id/favorite', // C'est l'URL exacte que le Frontend appelle
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const taskId = request.params.id;
        const userId = request.user.userId;
        // Le body contient le statut actuel (isFavorite) avant le basculement.
        const currentIsFavorite = request.body.isFavorite;

        // 1. Vérification de l'existence et de l'appartenance de la tâche (Sécurité)
        const task = await fastify.prisma.task.findUnique({
          where: { id: taskId },
          include: { taskList: true }, // Inclusion de la liste pour vérifier le propriétaire
        });

        if (!task || task.taskList.ownerId !== userId) {
          return reply
            .status(403)
            .send({ message: 'Accès interdit ou tâche non trouvée' });
        }

        // 2. Mise à jour de l'état isFavorite à l'opposé du statut actuel
        const updatedTask = await fastify.prisma.task.update({
          where: { id: taskId },
          data: {
            isFavorite: !currentIsFavorite, // Bascule l'état
          },
        });

        reply.status(200).send(updatedTask);
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la mise à jour du statut favori',
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
