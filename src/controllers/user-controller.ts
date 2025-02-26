import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { UserUpdate } from "../interfaces/user.interface";
import { UserService } from "../services/userService/user.service";

export class UserController {
  private userService: UserService;

  constructor(app: FastifyInstance) {
    this.userService = new UserService(app);
  }

  async findAll(req: FastifyRequest, reply: FastifyReply) {
    const users = await this.userService.findAll();
    return reply.status(200).send(users);
  }

  async findById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;
    const user = await this.userService.findById(id);
    return reply.status(200).send(user);
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;
    const user = await this.userService.delete(id);
    return reply.status(200).send(user);
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: UserUpdate }>, reply: FastifyReply) {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedUser = await this.userService.update(id, updatedData);
    return reply.status(200).send(updatedUser);
  }
}

