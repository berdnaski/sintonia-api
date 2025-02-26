import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { ICoupleRepository } from '../../interfaces/couple.interface';
import { IUserRepository } from '../../interfaces/user.interface';
import { MailProvider } from '../../providers/mail/implementations/MailProvider';
import { IMailProvider } from '../../providers/mail/models/IMailProvider';
import { InviteToCoupleMailTemplate } from '../../providers/mail/templates/InviteCoupleTemplate';
import { PrismaCoupleRepository } from '../../repositories/couple-repository';
import { PrismaUserRepository } from '../../repositories/user-repository';

export class CoupleService {
  private coupleRepository: ICoupleRepository;
  private userRepository: IUserRepository;
  private mailProvider: IMailProvider;

  constructor(fastify: FastifyInstance) {
    this.coupleRepository = new PrismaCoupleRepository();
    this.userRepository = new PrismaUserRepository();
    this.mailProvider = new MailProvider();
  }

  async invitePartner(inviterId: string, guestEmail: string) {
    const inviter = await this.userRepository.findOne(inviterId);
     if (!inviter) {
       throw new Error('O Usuário que envia o convite não encontrado.');
     }

    const inviterCouple = await this.coupleRepository.findCoupleByUserId(inviter.id);
    if (inviterCouple) {
      throw new Error('Você já está em um casal.');
    }

    const guestUser = await this.userRepository.findOne(guestEmail);
    if (!guestUser) {
      throw new Error('Usuário convidado não encontrado.');
    }

    const guestCouple = await this.coupleRepository.findCoupleByUserId(guestUser.id);
    if (guestCouple) {
      throw new Error('O convidado já está em um casal.');
    }

    const invite = await this.coupleRepository.createInvite({
      inviterId,
      inviteeEmail: guestEmail,
      token: uuidv4(),
      expiresAt: dayjs().add(24, 'hours').unix(),
    });

    await this.mailProvider.sendMail({
      to: {
        name: guestUser.name,
        email: guestEmail,
      },
      from: {
        name: `${process.env.MAILER_DISPLAY_NAME}`,
        email: `${process.env.MAILER_USERNAME}`,
      },
      subject: 'Convite para formar um casal',
      body: InviteToCoupleMailTemplate(inviter.name, guestUser.name, invite.token),
    });

    return { message: 'Invite send successfully' };
  }

  async cancelInvite(inviteId: string): Promise<{ message: string }> {
    try {
      if (!inviteId) {
        throw new Error('Invalid invite token');
      }

      const invite = await this.coupleRepository.findInviteByToken(inviteId);
      
      if (!invite) {
        throw new Error('Invite not found');
      }
      
      await this.coupleRepository.deleteInvite(invite.id);
      
      return { message: 'Invite cancelled successfully' };
    } catch (error) {
      throw error;
    }
  }
  
}