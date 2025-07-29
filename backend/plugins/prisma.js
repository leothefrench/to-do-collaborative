import fp from 'fastify-plugin';

import { PrismaClient } from '../generated/prisma/index.js';

async function prismaPlugin(fastify, options) {
  const prisma = new PrismaClient();

  await prisma.$connect();

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    if (instance.prisma === prisma) {
      await instance.prisma.$disconnect();
    }
  });
}

export default fp(prismaPlugin);