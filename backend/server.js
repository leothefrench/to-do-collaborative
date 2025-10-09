// Fichier : backend/server.js

import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
// ❌ Suppression de fastifyEnv
import prismaPlugin from './plugins/prisma.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskListRoutes from './routes/tasklistRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';

// ⚠️ NOUVEAU : Imports pour le chargement manuel du .env
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚨 CORRECTION CRITIQUE : Chargement du fichier .env qui est dans le dossier backend
dotenv.config({ path: path.join(__dirname, '.env') });

const fastify = Fastify({ logger: true });

// CORS Policy
fastify.register(cors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

fastify.register(fastifyCookie);

fastify.register(async (instance, opts) => {
  // ⚠️ On vérifie le chargement pour éviter le plantage
  if (!process.env.JWT_SECRET) {
    instance.log.error(
      'ERREUR CRITIQUE: JWT_SECRET non trouvé dans le backend. Vérifiez le fichier .env.'
    );
    // On lance une erreur pour arrêter le processus avant le plantage de fastify-jwt
    throw new Error('JWT_SECRET manquant pour la configuration Fastify-JWT');
  }

  // ✅ Utilisation de process.env.JWT_SECRET (maintenant chargé correctement)
  instance.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
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
