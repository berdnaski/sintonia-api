import 'dotenv/config';
import { fastify, type FastifyInstance } from "fastify";

const app: FastifyInstance = fastify();

app.listen(
  {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  () => console.log('listening on port ' + process.env.PORT)
)