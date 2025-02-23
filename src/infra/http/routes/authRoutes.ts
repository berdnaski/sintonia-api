import { fastifyAdapter } from "core/infra/adapters/FastifyRouterAdapter";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { makeSignInController } from "modules/accounts/useCases/SignIn";
import { makeSignUpController } from "modules/accounts/useCases/SignUp";

export async function authRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
  app.post('/register', fastifyAdapter(makeSignUpController()));
  app.post('/login', fastifyAdapter(makeSignInController()));
}