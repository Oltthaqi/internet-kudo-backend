import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import * as handlebars from 'handlebars';
import { SendEmailDTO } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', ''),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USERNAME', ''),
        pass: this.configService.get<string>('SMTP_PASSWORD', ''),
      },
    });
  }

  async sendEmail(
    sendEmailDTO: SendEmailDTO,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const mailOptions: SMTPTransport.Options = {
      from: this.configService.get<string>('SMTP_EMAIL', ''),
      to: sendEmailDTO.to,
      subject: sendEmailDTO.subject,
      html: sendEmailDTO.body,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.transporter.sendMail(mailOptions);
  }

  async sendInviteEmail(
    sendEmailDTO: SendEmailDTO,
    link: string,
    company_name: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const templatePath = join(__dirname, 'templates', 'invite-user.hbs');
    const source = await fsPromises.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(source);

    const html = template({
      inviteLink: link,
      company_name: company_name,
    });

    return this.sendEmail({
      to: sendEmailDTO.to,
      subject: sendEmailDTO.subject,
      body: html,
    });
  }

  async sendVerificationCodeEmail(
    email: string,
    code: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const subject = 'Email Verification Code';
    const html = `
    <p>Hi ${email},</p>
    <p>Your verification code is: <strong>${code}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `;

    return this.sendEmail({
      to: email,
      subject,
      body: html,
    });
  }
}
