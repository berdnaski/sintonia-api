import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user-controller";
import type { UserUpdate } from "../interfaces/user.interface";
import { Auth } from "../middlewares/auth";

export async function userRoutes(app: FastifyInstance) {
  const userController = new UserController(app);

  app.addHook("onRequest", Auth);

  app.get('/users', async (req, reply) => {
    await userController.findAll(req, reply);
  });

  app.get<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    await userController.findOne(req, reply);
  });

  app.delete<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    await userController.delete(req, reply);
  });

  app.put<{ Params: { id: string }, Body: UserUpdate }>('/users/:id', async (req, reply) => {
    await userController.update(req, reply);
  });

  app.get<{ Params: { email: string } }>("/users/recovery/send/:email", async (req, reply) => {
    await userController.sendRecoveryEmail(req, reply)
  })

  app.post<{ Params: { tokenId: string }, Body: { password: string } }>("/users/recovery/reset/:tokenId", async (req, reply) => {
    await userController.RecoveryUser(req, reply)
  })
}