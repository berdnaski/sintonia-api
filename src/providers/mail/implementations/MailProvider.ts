import Mail from "nodemailer/lib/mailer";
import { IMailProvider, IMessage } from "../models/IMailProvider";
import nodemailer from 'nodemailer'

export class MailProvider implements IMailProvider {
  private transporter: Mail
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: Number(process.env.MAILER_PORT),
      auth: {
        user: process.env.MAILER_USERNAME,
        pass: process.env.MAILER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  }
  async sendMail(message: IMessage): Promise<void> {
    await this.transporter.sendMail({
      to: {
        name: message.to.name,
        address: message.to.email
      },
      from: {
        name: message.from.name,
        address: message.from.email
      },
      subject: message.subject,
      html: message.body
    })
  }
}