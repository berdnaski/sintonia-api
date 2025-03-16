import dayjs from "dayjs";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { v4 } from "uuid";
import type { UserUpdate } from "../interfaces/user.interface";
import { MailProvider } from "../providers/mail/implementations/MailProvider";
import { RecoveryMailTemplate } from "../providers/mail/templates/RecoveryEmailTemplate copy";
import { TokensService } from "../services/tokenService/token.service";
import { UserService } from "../services/userService/user.service";
import { hashPassword } from "../utils/hash";

export class UserController {
  private userService: UserService;
  private tokenService: TokensService;
  private mailProvider: MailProvider;

  constructor(app: FastifyInstance) {
    this.userService = new UserService(app);
    this.tokenService = new TokensService();
    this.mailProvider = new MailProvider();
  }

  async sendRecoveryEmail(req: FastifyRequest<{ Params: { email: string } }>, reply: FastifyReply) {
    const { email } = req.params;

    const userResult = await this.userService.findOne(email);
    if (userResult.isLeft()) {
      return reply.status(400).send({ message: "This email does not exist." });
    }
    const account = userResult.value;

    const tokenResult = await this.tokenService.createToken({
      id: v4(),
      type: "recovery",
      used: false,
      user_id: account.id,
      expiresIn: dayjs().add(1, "hour").unix(),
    });
    if (tokenResult.isLeft()) {
      return reply.status(400).send({ message: "Failed to create recovery token." });
    }
    const token = tokenResult.value;

    await this.tokenService.saveToken(token);

    await this.mailProvider.sendMail({
      to: {
        name: account.name,
        email: account.email,
      },
      from: {
        name: `${process.env.MAILER_DISPLAY_NAME}`,
        email: `${process.env.MAILER_USERNAME}`,
      },
      subject: "Recuperação de Senha",
      body: RecoveryMailTemplate(account.name, token.id),
    });

    return reply.status(200).send();
  }

  async RecoveryUser(
    req: FastifyRequest<{ Body: { password: string }; Params: { tokenId: string } }>,
    reply: FastifyReply
  ) {
    const { password } = req.body;
    const { tokenId } = req.params;

    const tokenResult = await this.tokenService.getTokenById(tokenId);
    if (tokenResult.isLeft() || !tokenResult.value) {
      return reply.status(400).send({ message: "Invalid token." });
    }
    const token = tokenResult.value;

    if (token.type !== "recovery") {
      return reply.status(400).send({ message: "Invalid token." });
    }

    if (token.used) {
      return reply.status(400).send({ message: "This recovery link has already been used. Please request a new password recovery." });
    }

    const isExpired = dayjs().isAfter(dayjs.unix(token.expiresIn));
    if (isExpired) {
      return reply.status(400).send({ message: "Recovery link has expired. Please request a new password recovery." });
    }

    const accountResult = await this.userService.findOne(token.user_id);
    if (accountResult.isLeft()) {
      return reply.status(400).send({ message: "Invalid token." });
    }
    const account = accountResult.value;

    if (!password || password.trim().length < 6) {
      return reply.status(400).send({ message: "Password is required and must be at least 6 characters." });
    }

    const hashedPassword = await hashPassword(password);

    token.used = true;
    await this.tokenService.saveToken(token);

    const updateData: UserUpdate = { password: hashedPassword };
    const updateResult = await this.userService.save(account.id, updateData);
    if (updateResult.isLeft()) {
      return reply.status(400).send({ message: "Failed to update password." });
    }

    return reply.status(200).send({ message: "Password updated successfully." });
  }

  async findAll(req: FastifyRequest, reply: FastifyReply) {
    const usersResult = await this.userService.findAll();

    if (usersResult.isLeft()) {
      return reply.status(400).send({ message: "Failed to fetch users." });
    }

    return reply.status(200).send(usersResult.value);
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;

    const userResult = await this.userService.findOne(id);
    if (userResult.isLeft()) {
      return reply.status(400).send({ message: "User not found." });
    }

    return reply.status(200).send(userResult.value);
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;

    const deleteResult = await this.userService.delete(id);
    if (deleteResult.isLeft()) {
      return reply.status(400).send({ message: "User not found." });
    }

    return reply.status(200).send(deleteResult.value);
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: UserUpdate }>, reply: FastifyReply) {
    const { id } = req.params;
    const updatedData = req.body;

    const updateResult = await this.userService.save(id, updatedData);
    if (updateResult.isLeft()) {
      return reply.status(400).send({ message: "Failed to update user." });
    }

    return reply.status(200).send(updateResult.value);
  }

  async me(req: FastifyRequest, reply: FastifyReply) {
    const jwt = await req.jwtVerify<{
      id: string;
      email: string;
    }>();

    if (!jwt) {
      return reply.status(401).send({
        message: 'Token not found.'
      });
    }

    const { id } = jwt;
    const user = await this.userService.findOne(id);

    if (user.isLeft()) {
      return reply.status(404).send({
        message: 'User not found.'
      });
    }

    return reply.status(200).send(user.value);
  }
}
