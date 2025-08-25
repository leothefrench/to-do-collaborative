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

        reply.status(201).send({ message: 'User created successfully', token });
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

        // Comparaison des mots de passe
        if (!passwordsMatch) {
          return reply.status(401).send({ message: 'Identifiants invalides' });
        }

        // Génération du token JWT
        const token = fastify.jwt.sign({ userId: user.id });

        // Retourner le token au client
        reply.status(200).send({ message: 'Connexion réussie', token });
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la connexion',
        });
      }
    },
  });
}
