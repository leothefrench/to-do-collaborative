// Import framework & instantiation 

import Fastify from 'fastify';
const fastify = Fastify({ logger: true})

// We have to import plugin 
import prismaPlugin from './plugins/prisma.js';

// We have to register the plugin
fastify.register(prismaPlugin);

// Declaration Route 
fastify.get('/', async function(request, reply) {
    return { hello: 'world'}
})

// Run Server
try{
    await fastify.listen({ port: 3000 })
} catch(err) {
    fastify.log.error(err)
    process.exit(1)
}