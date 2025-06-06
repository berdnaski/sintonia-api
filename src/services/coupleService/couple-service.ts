import { Couple } from "@prisma/client";
import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { sintoniaConfig } from "../../config/api";
import { Either, left, right } from "../../errors/either";
import { RequiredParametersError } from "../../errors/required-parameters.error";
import { ICoupleInviteRepository } from "../../interfaces/couple-invite.interface";
import { ICoupleRepository, UpdateCopule } from "../../interfaces/couple.interface";
import { IUserRepository } from "../../interfaces/user.interface";
import { MailProvider } from "../../providers/mail/implementations/MailProvider";
import { InviteToCoupleMailTemplate } from "../../providers/mail/templates/InviteCoupleTemplate";
import { PrismaCoupleInvitesRepository } from "../../repositories/couple-invites-repository";
import { CoupleWithUsers, PrismaCoupleRepository } from "../../repositories/couple-repository";
import { PrismaUserRepository } from "../../repositories/user-repository";
import { CoupleMetricService } from "../coupleMetricService/couple-metric-service";

type PendingCouple = {
  id: string;
  relationshipStatus: "pending";
  user1Id: string;
  user2Id: string | null;
  createdAt: Date;
};

type InviteResponse = Either<RequiredParametersError, PendingCouple>;
type CancelInviteResponse = Either<RequiredParametersError, string>;
type AcceptInviteResponse = Either<RequiredParametersError, Couple>;
type DeleteCoupleResponse = Either<RequiredParametersError, string>;
type FindOneCoupleResponse = Either<RequiredParametersError, Couple>;
type FindOneByAnyUserCoupleResponse = Either<RequiredParametersError, CoupleWithUsers>;
type FindAllCoupleResponse = Either<RequiredParametersError, Couple[]>;
type UpdateResponse = Either<RequiredParametersError, Couple>

export class CoupleService {
  private coupleRepository: ICoupleRepository;
  private coupleInviteRepository: ICoupleInviteRepository;
  private userRepository: IUserRepository;
  private mailProvider: MailProvider;
  private metric: CoupleMetricService

  constructor(fastify: FastifyInstance) {
    this.coupleRepository = new PrismaCoupleRepository();
    this.coupleInviteRepository = new PrismaCoupleInvitesRepository();
    this.userRepository = new PrismaUserRepository();
    this.mailProvider = new MailProvider();
    this.metric = new CoupleMetricService(fastify);
  }

  async invitePartner(inviterId: string, inviteeEmail: string): Promise<InviteResponse> {
    const inviter = await this.userRepository.findOne(inviterId);

    if (!inviter) {
      return left(new RequiredParametersError("User who sent the invitation was not found.", 400));
    }

    const inviterCouple = await this.coupleRepository.findCoupleByUserId(inviter.id);

    if (inviterCouple) {
      return left(new RequiredParametersError("You already belong in a relationship."));
    }

    const invitee = await this.userRepository.findOne(inviteeEmail);
    let inviteeName = "amado(a)"; // default name if user not exists
    let url = "";

    const inviteeCouple = invitee ? await this.coupleRepository.findCoupleByUserId(invitee.id) : null;
    if (inviteeCouple) {
      return left(new RequiredParametersError("The Guest is already in a relationship."));
    }

    let existingInvite = await this.coupleInviteRepository.findInviteByInviteeEmail(inviteeEmail);

    if (existingInvite && !existingInvite.used) {
      return left(new RequiredParametersError("There is already a pending invitation for that email."));
    }

    existingInvite = await this.coupleInviteRepository.findInviteByInviterId(inviter.id);

    if (existingInvite && !existingInvite.used) {
      return left(new RequiredParametersError("Already have a pending invitation."));
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

    if (invitee) {
      url = `${sintoniaConfig.frontend}/auth/login/${invite.token}`;
    } else {
      url = `${sintoniaConfig.frontend}/auth/register-with-invite/token/${invite.token}`;
    }

    await this.mailProvider.sendMail({
      to: {
        name: inviteeName,
        email: inviteeEmail,
      },
      from: {
        name: `${process.env.MAILER_DISPLAY_NAME}`,
        email: `${process.env.MAILER_USERNAME}`,
      },
      subject: "Convite para formar um casal",
      body: InviteToCoupleMailTemplate(inviter.name, inviteeName, url),
    });

    return right({
      id: invite.id,
      relationshipStatus: "pending",
      user1Id: inviterId,
      user2Id: invitee ? invitee.id : null,
      token: invite.token,
      createdAt: invite.createdAt || new Date(),
    });
  }

  async cancelInvite(inviteId: string, inviterId: string): Promise<CancelInviteResponse> {
    const invite = await this.coupleInviteRepository.getById(inviteId);
    if (!invite) {
      return left(new RequiredParametersError("Invitation not found."));
    }

    if (invite.inviterId !== inviterId) {
      return left(new RequiredParametersError("You do not have permission to cancel this invitation."));
    }

    if (invite.used) {
      return left(new RequiredParametersError("Invitation has already been used."));
    }

    await this.coupleInviteRepository.remove(inviteId);
    return right("Invitation cancelled successfully")
  }

  async acceptInvite(token: string, inviteeId: string): Promise<AcceptInviteResponse> {
    const invite = await this.coupleInviteRepository.findInviteByToken(token);

    if (!invite) {
      return left(new RequiredParametersError("Invitation not found or invalid."));
    }

    if (invite.used) {
      return left(new RequiredParametersError("Invitation has already been used."));
    }

    if (dayjs().isAfter(dayjs.unix(invite.expiresAt))) {
      return left(new RequiredParametersError("Invitation has expired."));
    }

    const inviteeCouple = await this.coupleRepository.findCoupleByUserId(inviteeId);

    if (inviteeCouple) {
      return left(new RequiredParametersError("You are already in a couple."));
    }

    const inviterCouple = await this.coupleRepository.findCoupleByUserId(invite.inviterId);

    if (inviterCouple) {
      return left(new RequiredParametersError("The user who sent the invite is already in a couple."));
    }

    const couple = await this.coupleRepository.createCouple("active");

    this.userRepository.saveMany([invite.inviterId, inviteeId], {
      coupleId: couple.id,
    });

    invite.used = true;
    this.coupleInviteRepository.save(invite);

    this.metric.create({
      coupleId: couple.id
    })

    return right(couple);
  }

  async findAll(): Promise<FindAllCoupleResponse> {
    const couples = await this.coupleRepository.findAll();

    if (!couples) {
      return left(new RequiredParametersError("There is no record of a couple."))
    }

    return right(couples)
  }

  async findOne(id: string): Promise<FindOneCoupleResponse> {
    const couple = await this.coupleRepository.findOne(id);

    if (!couple) {
      return left(new RequiredParametersError("Couple not found.", 404, "NOT_FOUND"));
    }

    return right(couple);
  }

  async updateByUserId(userId: string, data: UpdateCopule): Promise<UpdateResponse> {
    const couple = await this.coupleRepository.findCoupleByUserId(userId);

    if (!couple) {
      return left(new RequiredParametersError("Couple not found", 404, "NOT_FOUND"));
    }

    const updatedCouple = await this.coupleRepository.update(couple.id, data);

    return right({
      ...couple,
      relationshipStatus: updatedCouple.relationshipStatus,
      startAt: updatedCouple.startAt,
      createdAt: updatedCouple.createdAt,
    })
  }

  async findByUserId(userId: string): Promise<FindOneByAnyUserCoupleResponse> {
    const couple = await this.coupleRepository.findCoupleByUserId(userId);

    if (!couple) {
      return left(new RequiredParametersError("Couple not found.", 404, 'NOT_FOUND'));
    }

    return right(couple);
  }

  async delete(id: string): Promise<DeleteCoupleResponse> {
    const couple = await this.coupleRepository.findOne(id);

    if (!couple) {
      return left(new RequiredParametersError("Couple not found."));
    }

    await this.coupleRepository.delete(id);

    return right("Couple successfully deleted.")
  }
}
