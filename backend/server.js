import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyEnv from '@fastify/env';
import prismaPlugin from './plugins/prisma.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskListRoutes from './routes/tasklistRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import cors from '@fastify/cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fastifyCookie from '@fastify/cookie';

const fastify = Fastify({ logger: true });

// CORS Policy
fastify.register(cors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

fastify.register(fastifyCookie); 

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
    dotenv: {
      path: path.join(__dirname, '.env'),
    },
  });

  // 2. À l'intérieur de ce callback, on est sûr que la configuration est chargée
  instance.log.info(`Le secret JWT est: ${instance.config.JWT_SECRET}`);

  // 3. Et on peut enregistrer le plugin JWT en utilisant la configuration
  instance.register(fastifyJwt, {
    secret: instance.config.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  // Function to authenticate requests using JWT
  instance.decorate('authenticate', async function (request, reply) {
    try {
      let token;
      const cookieToken = request.cookies ? request.cookies.token : undefined;
      const authHeader = request.headers.authorization;

      if (cookieToken) {
        token = cookieToken;
      } else if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      if (!token) {
        return reply.status(401).send({ message: 'Token manquant' });
      }

      await request.jwtVerify({ token });
    } catch (err) {
      reply.status(401).send({ message: 'Token invalide ou expiré' });
    }
  });

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
