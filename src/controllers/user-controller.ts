import dayjs from "dayjs";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { v4 } from "uuid";
import type { UserUpdate } from "../interfaces/user.interface";
import { MailProvider } from "../providers/mail/implementations/MailProvider";
import { RecoveryMailTemplate } from "../providers/mail/templates/RecoveryEmailTemplate copy";
import { TokensService } from "../services/tokenService/token.service";
import { UserService } from "../services/userService/user.service";
import { hashPassword } from "../utils/hash";
import { R2StorageProvider } from "../providers/storage/implementations/r2-storage-provider";
import { StorageProvider } from "../providers/storage/storage-provider";
export class UserController {
   private fastify: FastifyInstance;
  private userService: UserService;
  private tokenService: TokensService;
  private mailProvider: MailProvider;
  private storageProvider: StorageProvider;

  constructor(app: FastifyInstance) {
    this.fastify = app;
    this.userService = new UserService(app);
    this.tokenService = new TokensService();
    this.mailProvider = new MailProvider();
    this.storageProvider = new R2StorageProvider();
  }

  async sendResetPassword(req: FastifyRequest<{ Params: { email: string } }>, reply: FastifyReply) {
    const { email } = req.params;

    const userResult = await this.userService.findOne(email);

    if (userResult.isLeft()) {
      return reply.status(400).send({ message: "This user does not exist." });
    }

    const user = userResult.value;

    const tokenResult = await this.tokenService.createToken({
      id: v4(),
      type: "recovery",
      used: false,
      user_id: user.id,
      expiresIn: dayjs().add(1, "hour").unix(),
    });

    if (tokenResult.isLeft()) {
      return reply.status(400).send({ message: "Failed to create recovery token." });
    }

    const token = tokenResult.value;

    await this.mailProvider.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      from: {
        name: `${process.env.MAILER_DISPLAY_NAME}`,
        email: `${process.env.MAILER_USERNAME}`,
      },
      subject: "Recuperação de Senha",
      body: RecoveryMailTemplate(user.name, token.id),
    });

    return reply.status(200).send();
  }

  async resetPassword(
    req: FastifyRequest<{ Body: { password: string }; Params: { tokenId: string } }>,
    reply: FastifyReply
  ) {
    const { password } = req.body;
    const { tokenId } = req.params;

    const inviteTokenResult = await this.tokenService.getTokenById(tokenId);

    if (inviteTokenResult.isLeft() || !inviteTokenResult.value || inviteTokenResult.value.type !== "recovery") {
      return reply.status(400).send({ message: "Invalid token.", code: 'INVALID_TOKEN' });
    }

    const inviteToken = inviteTokenResult.value
    const isExpired = dayjs().isAfter(dayjs.unix(inviteToken.expiresIn));

    if (inviteToken.used || isExpired) {
      return reply.status(400).send({ message: "Recovery link has expired. Please request a new password recovery.", code: 'TOKEN_EXPIRED' });
    }

    const userResult = await this.userService.findOne(inviteToken.user_id);

    if (userResult.isLeft()) {
      return reply.status(400).send({ message: "Invalid token." });
    }
    const user = userResult.value;

    if (!password || password.trim().length < 6) {
      return reply.status(400).send({ message: "Password is required and must be at least 6 characters." });
    }

    const hashedPassword = await hashPassword(password);

    inviteToken.used = true;

    await this.tokenService.saveToken(inviteToken);

    const updateData: UserUpdate = { password: hashedPassword };

    const updateResult = await this.userService.save(user.id, updateData);

    if (updateResult.isLeft()) {
      return reply.status(400).send({ message: "Failed to update password." });
    }

    const jwtToken = this.fastify.jwt.sign({
      id: user?.id,
      email: user?.email,
    });

    return reply.status(200).send({ 
      user,
      token: jwtToken
     });
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

    if (updatedData.password) {
      updatedData.password = await hashPassword(updatedData.password);
    }

    const updateResult = await this.userService.save(id, updatedData);

    if (updateResult.isLeft()) {
      return reply.status(400).send({ message: "Failed to update user." });
    }

    let avatarUrl = updateResult.value.avatarUrl;

    if (avatarUrl) {
      avatarUrl = await this.storageProvider.getUrl(avatarUrl);
    }

    return reply.status(200).send({
      ...updateResult.value,
      avatarUrl
    });
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

    let avatarUrl = user.value.avatarUrl;

    if (avatarUrl) {
      avatarUrl = await this.storageProvider.getUrl(user.value.avatarUrl);
    }

    return reply.status(200).send({
      ...user.value,
      avatarUrl
    });
  }
}
