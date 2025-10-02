import bcrypt from 'bcrypt';
import { registerSchema, loginSchema } from '../schemas/userSchemas.js';

export default async function (fastify, option) {
  fastify.route({
    method: 'POST',
    url: '/register',
    schema: registerSchema,
    handler: async (request, reply) => {
      try {
        const { userName, password, email } = request.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await fastify.prisma.user.create({
          data: {
            userName,
            password: hashedPassword,
            email,
          },
        });

        const token = fastify.jwt.sign({ userId: user.id });

        // MODIFICATION IMPORTANTE : Définir le token comme cookie HttpOnly
        reply.setCookie('token', token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // false en dev local
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 jours
        });

        reply.status(201).send({
          message: 'User created successfully',
          user: { id: user.id, email: user.email, userName: user.userName },
        }); // On ne renvoie plus le token directement dans le body
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Error creating user',
        });
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: loginSchema,
    handler: async (request, reply) => {
      try {
        const { email, password } = request.body;

        const user = await fastify.prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return reply.status(401).send({ message: 'Identifiants invalides' });
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          return reply.status(401).send({ message: 'Identifiants invalides' });
        }

        const token = fastify.jwt.sign({ userId: user.id });

        // MODIFICATION IMPORTANTE : Définir le token comme cookie HttpOnly
        reply.setCookie('token', token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // false en dev local
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 jours
        });

        // On renvoie juste les infos de l'utilisateur (sans le token dans le body)
        reply.status(200).send({
          message: 'Connexion réussie',
          user: {
            id: user.id,
            email: user.email,
            userName: user.userName,
          },
        });
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la connexion',
        });
      }
    },
  });

  // Ajout d'une route pour la déconnexion qui efface le cookie
  fastify.route({
    method: 'POST',
    url: '/logout',
    handler: async (request, reply) => {
      // MODIFICATION IMPORTANTE : Effacer le cookie 'token'
      reply.clearCookie('token', { path: '/' });
      reply.status(200).send({ message: 'Déconnexion réussie' });
    },
  });

  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ message: 'Non autorisé' });
      }
      return {
        id: user.id,
        userName: user.userName,
        email: user.email,
      };
    }
  );
}
