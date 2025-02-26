import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CreateUser, UserLogin } from "../interfaces/user.interface";
import { AuthService } from "../services/authService/auth-service";

export class AuthController {
  private authService: AuthService;

  constructor(app: FastifyInstance) {
    this.authService = new AuthService(app);
  }

  async register(req: FastifyRequest<{ Body: CreateUser }>, reply: FastifyReply) {
    const { name, email, password } = req.body;

    const validateBody = CreateUser.safeParse({ name, email, password });
    if (!validateBody.success) {
      return reply.status(400).send({ error: validateBody.error.message });
    }

    const { user, token } = await this.authService.register({ name, email, password });

    reply.status(201).send({ user, token });
  }

  async login(req: FastifyRequest<{ Body: UserLogin }>, reply: FastifyReply) {
    const userData = req.body;

    const { user, token } = await this.authService.login(userData);

    reply.status(200).send({ user, token });
  }
}