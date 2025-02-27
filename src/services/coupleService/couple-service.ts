import { Couple } from "@prisma/client";
import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { ICoupleInviteRepository } from "../../interfaces/couple-invite.interface";
import { ICoupleRepository } from "../../interfaces/couple.interface";
import { IUserRepository } from "../../interfaces/user.interface";
import { MailProvider } from "../../providers/mail/implementations/MailProvider";
import { InviteToCoupleMailTemplate } from "../../providers/mail/templates/InviteCoupleTemplate";
import { PrismaCoupleInvitesRepository } from "../../repositories/couple-invites-repository";
import { PrismaCoupleRepository } from "../../repositories/couple-repository";
import { PrismaUserRepository } from "../../repositories/user-repository";
import { prisma } from "../../database/prisma-client";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";

type InviteResponse = Either<RequiredParametersError, Couple>;
type CoupleResponse = Either<RequiredParametersError, Couple>;

export class CoupleService {
  private coupleRepository: ICoupleRepository;
  private coupleInviteRepository: ICoupleInviteRepository;
  private userRepository: IUserRepository;
  private mailProvider: MailProvider;

  constructor(fastify: FastifyInstance) {
    this.coupleRepository = new PrismaCoupleRepository();
    this.coupleInviteRepository = new PrismaCoupleInvitesRepository();
    this.userRepository = new PrismaUserRepository();
    this.mailProvider = new MailProvider();
  }

  async invitePartner(inviterId: string, inviteeEmail: string): Promise<InviteResponse> {
    const inviter = await this.userRepository.findOne(inviterId);
    if (!inviter) {
      return left(new RequiredParametersError("Usuário que enviou o convite não foi encontrado.", 400))
    }

    const inviterCouple = await this.coupleRepository.findCoupleByUserId(inviter.id);
    if (inviterCouple) {
      return left(new RequiredParametersError("Você já pertence a um relacionamento."));
    }

    const invitee = await this.userRepository.findOne(inviteeEmail);
    if (!invitee) {
      return left(new RequiredParametersError("Usuário convidado não foi encontrado.", 400))
    }

    const inviteeCouple = await this.coupleRepository.findCoupleByUserId(invitee.id);
    if (inviteeCouple) {
      return left(new RequiredParametersError("O Convidado já pertence a um relacionamento."));
    }

    const existingInvite = await this.coupleInviteRepository.findInviteByInviteeEmail(inviteeEmail);
    if (existingInvite && !existingInvite.used) {
      return left(new RequiredParametersError("Já existe um convite pendente para esse email"))
    }

    const invite = await this.coupleInviteRepository.create({
      id: uuidv4(),
      inviterId,
      inviteeEmail,
      token: uuidv4(),
      expiresAt: dayjs().add(24, "hours").unix(),
      used: false,
      createdAt: new Date(),
    });

    await this.mailProvider.sendMail({
      to: {
        name: invitee.name,
        email: inviteeEmail
      },
      from: {
        name: `${process.env.MAILER_DISPLAY_NAME}`,
        email: `${process.env.MAILER_USERNAME}`
      },
      subject: "Convite para formar um casal",
      body: InviteToCoupleMailTemplate(inviter.name, invitee.name, invite.token),
    });

    return right({
      id: invite.id,
      relationshipStatus: 'pending',
      user1Id: inviterId,
      user2Id: invitee.id,
      createdAt: invite.createdAt || new Date() 
    });
  }

  async cancelInvite(inviteId: string, inviterId: string): Promise<{ message: string }> {
    const invite = await this.coupleInviteRepository.getById(inviteId);
    if (!invite) {
      throw new Error("Invitation not found.");
    }

    if (invite.inviterId !== inviterId) {
      throw new Error("You do not have permission to cancel this invitation.");
    }

    if (invite.used) {
      throw new Error("Invitation has already been used.");
    }

    await this.coupleInviteRepository.remove(inviteId);
    return { message: "Invitation cancelled successfully" };
  }

  async acceptInvite(token: string, inviteeId: string): Promise<Couple> {
    const invite = await this.coupleInviteRepository.findInviteByToken(token);
    if (!invite) {
      throw new Error("Invitation not found or invalid.");
    }

    if (invite.used) {
      throw new Error("Invitation has already been used.");
    }

    if (dayjs().isAfter(dayjs.unix(invite.expiresAt))) {
      throw new Error("Invitation has expired.");
    }
    
    const inviteeCouple = await this.coupleRepository.findCoupleByUserId(inviteeId);
    if (inviteeCouple) {
      throw new Error("You are already in a couple.");
    }
    
    const inviterCouple = await this.coupleRepository.findCoupleByUserId(invite.inviterId);
    if (inviterCouple) {
      throw new Error("The user who sent the invite is already in a couple.");
    }

    const invitee = await this.userRepository.findOne(invite.inviteeEmail);
    const couple = await this.coupleRepository.createCouple(invite.inviterId, invitee.id, "active");

    invite.used = true;
    await this.coupleInviteRepository.save(invite);

    return couple;
  }

  async findAll(): Promise<Couple[]> {
    return this.coupleRepository.findAll();
  }

  async findOne(id: string): Promise<Couple> {
    const couple = await this.coupleRepository.findOne(id);

    if (!couple) {
      throw new Error("Couple not found.");
    }

    return couple;
  }

  async delete(id: string): Promise<void> {
    const couple = await this.coupleRepository.findOne(id);

    if (!couple) {
      throw new Error("Couple not found.");
    }

    await this.coupleRepository.delete(id);
  }
}