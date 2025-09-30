import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import * as handlebars from 'handlebars';
import * as QRCode from 'qrcode';
import { SendEmailDTO } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private logoUrl: string | undefined;

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

  async sendOrderCompletionEmail(
    email: string,
    orderData: {
      orderNumber: string;
      packageName: string;
      dataVolume: string;
      validityDays: number;
      amount: number;
      currency: string;
      qrCodeUrl?: string;
      qrCodeText?: string;
      logoUrl?: string;
    },
  ): Promise<SMTPTransport.SentMessageInfo> {
    const templatePath = join(__dirname, 'templates', 'order-completion.hbs');
    const source = await fsPromises.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(source);

    // Generate QR code image if we have QR code text but no URL
    let qrCodeImageUrl = orderData.qrCodeUrl;
    console.log('🔍 Email service QR code data:', {
      qrCodeUrl: orderData.qrCodeUrl,
      qrCodeText: orderData.qrCodeText,
      hasText: !!orderData.qrCodeText,
    });

    if (!qrCodeImageUrl && orderData.qrCodeText) {
      try {
        console.log(
          '🔧 Generating QR code image from text:',
          orderData.qrCodeText,
        );
        console.log('🔧 Text length:', orderData.qrCodeText.length);
        console.log('🔧 Text type:', typeof orderData.qrCodeText);

        // Generate QR code as data URL
        qrCodeImageUrl = await QRCode.toDataURL(orderData.qrCodeText, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        console.log(
          '✅ Generated QR code image successfully, length:',
          qrCodeImageUrl.length,
        );
        console.log(
          '✅ QR code data URL starts with:',
          qrCodeImageUrl.substring(0, 50) + '...',
        );
      } catch (error) {
        console.log('❌ Failed to generate QR code image:', error);
        console.log('❌ Error details:', error.message);
      }
    } else {
      console.log('⚠️ Not generating QR code image:', {
        hasUrl: !!qrCodeImageUrl,
        hasText: !!orderData.qrCodeText,
      });
    }

    const templateData = {
      orderNumber: orderData.orderNumber,
      packageName: orderData.packageName,
      dataVolume: orderData.dataVolume,
      validityDays: orderData.validityDays,
      amount: orderData.amount,
      currency: orderData.currency,
      qrCodeUrl: qrCodeImageUrl,
      qrCodeText: orderData.qrCodeText,
      logoUrl: orderData.logoUrl,
    };

    console.log('🔍 Template data for email:', {
      qrCodeUrl: templateData.qrCodeUrl ? 'Present' : 'Missing',
      qrCodeText: templateData.qrCodeText ? 'Present' : 'Missing',
      logoUrl: templateData.logoUrl ? 'Present' : 'Missing',
    });

    const html = template(templateData);

    return this.sendEmail({
      to: email,
      subject: 'Kartela juaj eSIM është gati!',
      body: html,
    });
  }

  setLogoUrl(logoUrl: string): void {
    this.logoUrl = logoUrl;
  }

  getLogoUrl(): string | undefined {
    return this.logoUrl;
  }
}
