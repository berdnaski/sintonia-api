import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user-controller";
import type { UserUpdate } from "../interfaces/user.interface";
import { auth } from "../middlewares/auth";


export async function userRoutes(app: FastifyInstance) {
  const userController = new UserController(app);

  app.addHook("onRequest", auth);

  app.get('/users', async (req, reply) => {
    await userController.findAll(req, reply);
  });

  app.get<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    await userController.findById(req, reply);
  });

  app.delete<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    await userController.delete(req, reply);
  });

  app.put<{ Params: { id: string }, Body: UserUpdate }>('/users/:id', async (req, reply) => {
    await userController.update(req, reply);
  });
}