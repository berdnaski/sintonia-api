import { User } from "@prisma/client";
import dayjs from "dayjs";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { v4 } from "uuid";
import type { UserUpdate } from "../interfaces/user.interface";
import { MailProvider } from "../providers/mail/implementations/MailProvider";
import { RecoveryMailTemplate } from "../providers/mail/templates/RecoveryEmailTemplate";
import { TokensService } from "../services/tokenService/token.service";
import { UserService } from "../services/userService/user.service";
import { hashPassword } from "../utils/hash";

export class UserController {
  private userService: UserService;
  private tokenService: TokensService;
  private mailProvider: MailProvider;

  constructor(app: FastifyInstance) {
    this.userService = new UserService(app);
    this.tokenService = new TokensService(app);
    this.mailProvider = new MailProvider();
  }

  async sendRecoveryEmail(req: FastifyRequest<{ Params: { email: string } }>, reply: FastifyReply) {
    const { email } = req.params;

    const userExists = await this.userService.findOne(email);

    if (!userExists) {
      throw new Error("This email not exists.");
    }

    const account = userExists as User

    const token = await this.tokenService.createToken({
      id: v4(),
      type: 'recovery',
      used: false,
      user_id: account.id,
      expiresIn: dayjs().add(1, 'hour').unix(),
    })

    // await this.userService.save(account.id, account);
    await this.tokenService.saveToken(token);

    await this.mailProvider.sendMail({
      to: {
        name: account.name,
        email: account.email,
      },
      from: {
        name: `${process.env.MAILER_DISPLAY_NAME}`,
        email: `${process.env.MAILER_USERNAME}`
      },
      subject: 'Recuperação de Senha',
      body: RecoveryMailTemplate(account.name, token.id)
    })

    return reply.status(200).send();
  }

  async RecoveryUser(req: FastifyRequest<{ Body: { password: string }, Params: { tokenId: string } }>, reply: FastifyReply) {
    const { password } = req.body;
    const { tokenId } = req.params;

    const token = await this.tokenService.getTokenById(tokenId);

    if (!token || token.type !== 'recovery') {
      return reply.status(400).send({ message: 'Invalid token.' });
    }

    if (token.used) {
      return reply.status(400).send({ message: 'This recovery link has already been used. Please request a new password recovery.' });
    }

    const isExpired = dayjs().isAfter(dayjs.unix(token.expiresIn));
    if (isExpired) {
      return reply.status(400).send({ message: 'Recovery link has expired. Please request a new password recovery' });
    }

    const account = await this.userService.findOne(token.user_id);
    if (!account) {
      return reply.status(400).send({ message: 'Invalid token.' });
    }

    if (!password || password.trim().length < 6) {
      return reply.status(400).send({ message: 'Password is required.' });
    }

    const hashedPassword = await hashPassword(password);

    token.used = true;
    await this.tokenService.saveToken(token);
    const updateData: UserUpdate = {
      password: hashedPassword
    };
    await this.userService.save(account.id, updateData);

    return reply.status(200).send({ message: 'Password updated successfully.' });
  }

  async findAll(req: FastifyRequest, reply: FastifyReply) {
    const users = await this.userService.findAll();
    return reply.status(200).send(users);
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params;
    const user = await this.userService.findOne(id);
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
    const updatedUser = await this.userService.save(id, updatedData);
    return reply.status(200).send(updatedUser);
  }
}

