import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyEnv from '@fastify/env';
import prismaPlugin from './plugins/prisma.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskListRoutes from './routes/tasklistRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

// CORS Policy
fastify.register(cors, {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
});

fastify.register(async (instance, opts) => {
  await instance.register(fastifyEnv, {
    confKey: 'config',
    dotenv: true,
    schema: {
      type: 'object',
      required: ['JWT_SECRET', 'DATABASE_URL'],
      properties: {
        JWT_SECRET: { type: 'string' },
        DATABASE_URL: { type: 'string' },
      },
    },
  });

  // 2. À l'intérieur de ce callback, on est sûr que la configuration est chargée
  instance.log.info(`Le secret JWT est: ${instance.config.JWT_SECRET}`);

  // 3. Et on peut enregistrer le plugin JWT en utilisant la configuration
  instance.register(fastifyJwt, {
    secret: instance.config.JWT_SECRET,
  });

  // Function to authenticate requests using JWT
  instance.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err)
  }
})

  instance.register(prismaPlugin);
  instance.register(authRoutes, { prefix: '/auth' });
  instance.register(userRoutes);
  instance.register(taskListRoutes);
  instance.register(taskRoutes);

  // Declaration Route
  instance.get('/', async function (request, reply) {
    return { hello: 'world' };
  });
});

// Run Server
try {
  await fastify.listen({ port: 3001 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
