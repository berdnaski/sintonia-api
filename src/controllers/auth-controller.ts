import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CreateUser, UserLogin } from "../interfaces/user.interface";
import { AuthService } from "../services/authService/auth-service";
import { hashPassword } from "../utils/hash";

export class AuthController {
  private authService: AuthService;

  constructor(app: FastifyInstance) {
    this.authService = new AuthService(app);
  }

  async register(req: FastifyRequest<{ Body: CreateUser }>, reply: FastifyReply) {
    const { name, email, password } = req.body;

    const validateBody = CreateUser.safeParse({ name, email, password });
    if (!validateBody.success) {
      const errors = validateBody.error.flatten().fieldErrors
      return reply.status(400).send({
        message: 'Invalid data.',
        errors,
      });
    }

    const hashedPassword = await hashPassword(password);

    const { user, token } = await this.authService.register({ name, email, password: hashedPassword });

    reply.status(201).send({ user, token });
  }

  async login(req: FastifyRequest<{ Body: UserLogin }>, reply: FastifyReply) {
    const { email, password } = req.body;

    const validateBody = UserLogin.safeParse({ email, password });
    if (!validateBody.success) {
      const errors = validateBody.error.flatten().fieldErrors
      return reply.status(400).send({
        message: 'Invalid data.',
        errors,
      });
    }

    const { user, token } = await this.authService.login({ email, password });

    reply.status(200).send({ user, token });
  }
}