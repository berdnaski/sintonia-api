import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import fastifyRawBody from 'fastify-raw-body';
import 'dotenv/config';
import { fastify, type FastifyInstance } from "fastify";
import fastifyJwt from "fastify-jwt";
import { errorHandler } from './middlewares/error-handler';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { coupleRoutes } from './routes/coupleRoutes';
import { signalRoutes } from './routes/signalRoutes';
import { checkoutRoutes } from './routes/checkoutRoutes';
import { webhookRoutes } from './routes/webhookRoutes';

const app: FastifyInstance = fastify();

app.register(fastifyJwt, {
  secret: process.env.SECRET_KEY as string,
  sign: {
    expiresIn: '1d',
  }
});

app.setErrorHandler(errorHandler);
app.register(fastifyCors);
app.register(fastifyFormbody);

// Registro do 'fastify-raw-body' apenas para rotas de webhook
app.register(fastifyRawBody, {
  field: 'rawBody',  // Armazena o corpo da requisição em 'rawBody'
  encoding: 'utf-8',
});

// Registrar as rotas
app.register(authRoutes, { prefix: 'auth' });
app.register(userRoutes);
app.register(checkoutRoutes);
app.register(coupleRoutes);
app.register(signalRoutes);
app.register(webhookRoutes, { prefix: 'data' });  // As rotas de webhook estão com o prefixo 'data'

// Iniciar o servidor
const PORT = Number(process.env.PORT) || 3000;
app.listen({ port: PORT }, () => console.log(`listening on port ${PORT}`));
