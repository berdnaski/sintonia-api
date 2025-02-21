import 'dotenv/config';
import { fastify, type FastifyInstance } from "fastify";
import cors from "@fastify/cors"

const app: FastifyInstance = fastify();

app.register(cors, {
  origin: process.env.HOST,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization']
})

app.listen(
  {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  () => console.log('listening on port ' + process.env.PORT)
)