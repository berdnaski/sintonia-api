import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { CreateUser } from "../interfaces/user.interface";
import { AuthController } from "../controllers/auth-controller";

export async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController(app);

  app.post<{ Body: CreateUser }>("/register", async (req, reply) => {
    await authController.register(req, reply);
  })
}