import { fastifyAdapter } from "core/infra/adapters/FastifyRouterAdapter";
import type { FastifyInstance } from "fastify";
import { makeGetAllUsersController } from "modules/accounts/useCases/GetAllUsers";
import { makeGetUserByIdController } from "modules/accounts/useCases/GetUserById";
import { EnsureAuthenticatedMiddlewareRequest } from "../middlewares/EnsureAuthenticatedMiddlewareRequest";

export async function userRoutes(app: FastifyInstance) {
  app.addHook("onRequest", EnsureAuthenticatedMiddlewareRequest);

  app.get('/users', fastifyAdapter(makeGetAllUsersController()));
  app.get('/user/:id', fastifyAdapter(makeGetUserByIdController()));
}