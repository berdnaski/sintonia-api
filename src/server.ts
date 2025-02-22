import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import 'dotenv/config';
import { fastify, type FastifyInstance } from "fastify";
import fastifyJwt from "fastify-jwt";
import { errorHandler } from './middlewares/error-handler';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';

const app: FastifyInstance = fastify();

app.register(fastifyJwt, {
  secret: process.env.SECRET_KEY as string,
  sign: {
    expiresIn: '1d',
  }
})

app.setErrorHandler(errorHandler);
app.register(fastifyCors)
app.register(fastifyFormbody)
app.register(userRoutes);
app.register(authRoutes, { prefix: 'auth' });

const PORT = Number(process.env.PORT) || 3000
app.listen({ port: PORT }, () => console.log(`listening on port ${PORT}`))