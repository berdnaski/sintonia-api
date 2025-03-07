import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
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
      const errors = validateBody.error.flatten().fieldErrors
      return reply.status(400).send({
        message: 'Invalid data.',
        errors,
      });
    }

    const result = await this.authService.register({ name, email, password });
    if (result.isLeft()) {
      const error = result.value;
      return reply.status(400).send({ message: error.message });
    } else {
      const { user, token } = result.value;
      reply.status(201).send({ user, token });
    }
  }

  async registerWithInvite(
    req: FastifyRequest<{ Body: CreateUser, Params: { inviteToken: string } }>,
    reply: FastifyReply
  ) {
    const { name, email, password } = req.body;
    const { inviteToken } = req.params;

    const validateBody = CreateUser.safeParse({ name, email, password });
    if (!validateBody.success) {
      const errors = validateBody.error.flatten().fieldErrors;
      return reply.status(400).send({
        message: "Invalid data.",
        errors,
      });
    }

    const result = await this.authService.registerWithInvite({
      name,
      email,
      password,
      inviteToken,
    });

    if (result.isLeft()) {
      const error = result.value;
      return reply.status(400).send({ message: error.message });
    } else {
      const { user, token, couple } = result.value;
      reply.status(201).send({ user, token, couple });
    }
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

    const result = await this.authService.login({ email, password });
    if (result.isLeft()) {
      const error = result.value;
      return reply.status(400).send({ message: error.message });
    } else {
      const { user, token } = result.value;
      reply.status(200).send({ user, token });
    }
  }
}