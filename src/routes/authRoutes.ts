import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth-controller";
import type { CreateUser, UserLogin } from "../interfaces/user.interface";

export async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController(app);

  app.post<{ Body: CreateUser }>("/register", async (req, reply) => {
    await authController.register(req, reply);
  })

  app.post<{ Body: CreateUser, Params: { inviteToken: string } }>("/register-with-invite/token/:inviteToken", async (req, reply) => {
    await authController.registerWithInvite(req, reply);
  });

  app.post<{ Body: UserLogin }>("/login", async (req, reply) => {
    await authController.login(req, reply);
  })
}