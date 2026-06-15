import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private isMock = true;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port');
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.isMock = false;
    } else {
      this.logger.warn(
        'Email SMTP credentials not configured. MailService running in MOCK mode (Action links will print to terminal console).',
      );
      this.isMock = true;
    }
  }

  /**
   * Send verification email containing account activation link
   */
  async sendVerificationCode(email: string, token: string): Promise<void> {
    const subject = 'Xác minh tài khoản của bạn - JobMatching';
    const apiPrefix =
      this.configService.get<string>('app.apiPrefix') || 'api/v1';
    const port = this.configService.get<number>('app.port') || 3000;
    const actionUrl = `http://localhost:${port}/${apiPrefix}/auth/verify-account?token=${token}`;

    const html = this.getLinkTemplate(
      email,
      actionUrl,
      'Xác minh tài khoản của bạn',
      'Cảm ơn bạn đã đăng ký tài khoản tại JobMatching. Vui lòng nhấn vào nút dưới đây để kích hoạt tài khoản và hoàn tất quá trình xác minh.',
      'Kích hoạt tài khoản',
    );
    await this.sendMail(email, subject, html, actionUrl);
  }

  /**
   * Send password reset email containing password recovery link
   */
  async sendForgotPasswordCode(email: string, token: string): Promise<void> {
    const subject = 'Khôi phục mật khẩu tài khoản của bạn - JobMatching';
    const apiPrefix =
      this.configService.get<string>('app.apiPrefix') || 'api/v1';
    const port = this.configService.get<number>('app.port') || 3000;
    const actionUrl = `http://localhost:${port}/${apiPrefix}/auth/reset-password-page?token=${token}`;

    const html = this.getLinkTemplate(
      email,
      actionUrl,
      'Khôi phục mật khẩu của bạn',
      'Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Nhấn vào nút dưới đây để chuyển đến trang đặt lại mật khẩu mới.',
      'Đặt lại mật khẩu',
    );
    await this.sendMail(email, subject, html, actionUrl);
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
    actionUrl: string,
  ): Promise<void> {
    const from = this.configService.get<string>('mail.from');

    if (this.isMock) {
      this.logger.log(`
============================================================
[MOCK EMAIL SENT]
To: ${to}
Subject: ${subject}
Action Link: ${actionUrl}
============================================================
      `);
      return;
    }

    try {
      await this.transporter!.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email successfully sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );
      // Fallback to console print so developers don't get blocked
      this.logger.warn(`FALLBACK Action Link for ${to}: ${actionUrl}`);
    }
  }

  private getLinkTemplate(
    email: string,
    actionUrl: string,
    title: string,
    description: string,
    buttonText: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f6f9fc;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f6f9fc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      padding: 35px 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
    }
    .welcome-text {
      font-size: 16px;
      line-height: 24px;
      color: #475569;
      margin-bottom: 25px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .action-btn {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
    }
    .expiration-notice {
      font-size: 13px;
      color: #ef4444;
      text-align: center;
      margin-top: 15px;
      font-weight: 500;
    }
    .raw-link-container {
      margin-top: 25px;
      padding: 15px;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .raw-link-title {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .raw-link {
      color: #4f46e5;
      word-break: break-all;
      font-size: 12px;
      text-decoration: none;
    }
    .footer {
      background-color: #f8fafc;
      padding: 25px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 18px;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 25px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="content">
        <p class="welcome-text">Xin chào <strong>${email}</strong>,</p>
        <p class="welcome-text">${description}</p>
        
        <div class="btn-container">
          <a href="${actionUrl}" class="action-btn">${buttonText}</a>
          <div class="expiration-notice">Liên kết này có hiệu lực trong vòng 10 phút</div>
        </div>

        <div class="raw-link-container">
          <div class="raw-link-title">Nếu nút trên không hoạt động, vui lòng copy đường dẫn dưới đây dán vào trình duyệt:</div>
          <a href="${actionUrl}" class="raw-link">${actionUrl}</a>
        </div>
        
        <p class="welcome-text" style="margin-top: 25px; font-size: 14px; color: #64748b;">
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn sẽ an toàn.
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} JobMatching. Tất cả các quyền được bảo lưu.</p>
        <p>Hệ thống kết nối việc làm thông minh và tiếp cận WCAG 2.2.</p>
        <p><a href="#">Trung tâm Hỗ trợ</a> | <a href="#">Điều khoản sử dụng</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}
