import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import 'dotenv/config';
import { fastify, type FastifyInstance } from "fastify";
import { userRoutes } from 'infra/http/routes/userRoutes';
import { authRoutes } from './infra/http/routes/authRoutes';

export const app: FastifyInstance = fastify();

app.register(formbody)
app.register(cors)
app.register(helmet)
app.register(authRoutes, { prefix: 'auth' });
app.register(userRoutes);

const PORT = Number(process.env.PORT) || 3000
app.listen({ port: PORT }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`listening on port ${PORT}`)
})