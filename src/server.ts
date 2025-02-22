import 'dotenv/config';
import { fastify, type FastifyInstance } from "fastify";
import cors from "@fastify/cors"
import { authRoutes } from './routes/authRoutes';
import fastifyJwt from "fastify-jwt"
import { errorHandler } from './middlewares/error-handler';
import { userRoutes } from './routes/userRoutes';

const app: FastifyInstance = fastify();

// app.register(cors, {
//   origin: process.env.HOST,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization']
// })

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
  sign: {
    expiresIn: '1h',
  }
})

app.register(authRoutes, { prefix: 'auth' });
app.register(userRoutes);

app.setErrorHandler(errorHandler);

app.listen(
  {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  () => console.log('listening on port ' + process.env.PORT)
)