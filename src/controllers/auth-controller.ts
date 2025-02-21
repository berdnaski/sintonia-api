import type { FastifyInstance, FastifyRegister, FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/authService/auth-service";
import type { CreateUser, UserLogin } from "../interfaces/user.interface";

export class AuthController {
  private authService: AuthService;

  constructor(app: FastifyInstance) {
    this.authService = new AuthService(app);
  }

  async register(req: FastifyRequest<{ Body: CreateUser }>, reply: FastifyReply) {
    const userData = req.body;

    const { user, token } = await this.authService.register(userData);

    reply.status(201).send({ user, token });
  }

  async login(req: FastifyRequest<{ Body: UserLogin }>, reply: FastifyReply) {
    const userData = req.body;

    const { user, token } = await this.authService.login(userData);

    reply.status(200).send({ user, token });
  }
}