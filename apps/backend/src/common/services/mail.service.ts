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
   * Send verification email containing OTP code
   */
  async sendVerificationCode(email: string, token: string): Promise<void> {
    const subject = 'Xác minh tài khoản của bạn - JobMatching';
    const html = this.getOtpTemplate(
      email,
      'Xác minh tài khoản của bạn',
      'Cảm ơn bạn đã đăng ký tài khoản tại JobMatching. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất xác minh tài khoản.',
      token,
    );
    await this.sendMail(email, subject, html, token);
  }

  /**
   * Send password reset email containing OTP code
   */
  async sendForgotPasswordCode(email: string, token: string): Promise<void> {
    const subject = 'Khôi phục mật khẩu tài khoản của bạn - JobMatching';
    const html = this.getOtpTemplate(
      email,
      'Khôi phục mật khẩu',
      'Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã xác nhận bên dưới để đặt lại mật khẩu mới.',
      token,
    );
    await this.sendMail(email, subject, html, token);
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
    code: string,
  ): Promise<void> {
    const from = this.configService.get<string>('mail.from');

    if (this.isMock) {
      this.logger.log(`
************************************************************
[MOCK EMAIL SENT]
To: ${to}
Subject: ${subject}
OTP Code: ${code}
************************************************************
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
      this.logger.warn(`FALLBACK OTP Code for ${to}: ${code}`);
    }
  }

  private getOtpTemplate(
    email: string,
    title: string,
    description: string,
    code: string,
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
    .otp-container {
      text-align: center;
      margin: 30px 0;
      padding: 24px;
      background-color: #f8fafc;
      border-radius: 12px;
      border: 1px dashed #cbd5e1;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: 6px;
      margin: 10px 0;
    }
    .expiration-notice {
      font-size: 13px;
      color: #ef4444;
      font-weight: 500;
      margin-top: 5px;
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
        
        <div class="otp-container">
          <div class="otp-label">Mã xác thực của bạn (OTP)</div>
          <div class="otp-code">${code}</div>
          <div class="expiration-notice">Mã xác nhận này có hiệu lực trong vòng 10 phút</div>
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

  /**
   * Send interview invitation email to candidate
   */
  async sendInterviewInvitation(
    email: string,
    candidateName: string,
    jobTitle: string,
    companyName: string,
    interviewTime: string,
    notes?: string,
  ): Promise<void> {
    const subject = `Lời mời phỏng vấn vị trí ${jobTitle} - ${companyName}`;
    const formattedDate = new Date(interviewTime).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    const html = this.getInterviewInvitationTemplate(
      candidateName,
      jobTitle,
      companyName,
      formattedDate,
      notes,
    );

    const from = this.configService.get<string>('mail.from');
    if (this.isMock) {
      this.logger.log(`
************************************************************
[MOCK EMAIL SENT - INTERVIEW INVITATION]
To: ${email}
Subject: ${subject}
Candidate: ${candidateName}
Job: ${jobTitle}
Company: ${companyName}
Time: ${formattedDate}
Notes: ${notes || 'N/A'}
************************************************************
      `);
      return;
    }

    try {
      await this.transporter!.sendMail({
        from,
        to: email,
        subject,
        html,
      });
      this.logger.log(`Interview invitation email successfully sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send interview invitation to ${email}: ${error.message}`,
        error.stack,
      );
    }
  }

  private getInterviewInvitationTemplate(
    candidateName: string,
    jobTitle: string,
    companyName: string,
    interviewTime: string,
    notes?: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thư mời phỏng vấn</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f7f6;
      color: #2d3748;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f7f6;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 177, 79, 0.05), 0 1px 8px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #00b14f, #00873c);
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
    }
    .welcome-text {
      font-size: 16px;
      line-height: 26px;
      color: #4a5568;
      margin-bottom: 20px;
    }
    .details-box {
      margin: 30px 0;
      padding: 24px;
      background-color: #f8faf9;
      border-radius: 16px;
      border-left: 5px solid #00b14f;
    }
    .details-row {
      margin-bottom: 12px;
      font-size: 15px;
      line-height: 22px;
    }
    .details-row:last-child {
      margin-bottom: 0;
    }
    .details-label {
      font-weight: 700;
      color: #1a202c;
      display: inline-block;
      width: 150px;
    }
    .details-value {
      color: #2d3748;
    }
    .notes-box {
      margin-top: 20px;
      padding: 16px;
      background-color: #fffaf0;
      border-radius: 12px;
      border: 1px solid #feebc8;
      font-size: 14px;
      line-height: 22px;
      color: #dd6b20;
    }
    .footer {
      background-color: #f8faf9;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #edf2f7;
    }
    .footer p {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #a0aec0;
      line-height: 18px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Thư Mời Phỏng Vấn</h1>
      </div>
      <div class="content">
        <p class="welcome-text">Thân gửi bạn <strong>${candidateName}</strong>,</p>
        <p class="welcome-text">
          Chúng tôi rất ấn tượng với hồ sơ ứng tuyển của bạn cho vị trí <strong>${jobTitle}</strong>. 
          Thay mặt công ty <strong>${companyName}</strong>, chúng tôi trân trọng kính mời bạn tham gia buổi phỏng vấn để trao đổi chi tiết hơn về công việc.
        </p>
        
        <div class="details-box">
          <div class="details-row">
            <span class="details-label">Vị trí ứng tuyển:</span>
            <span class="details-value"><strong>${jobTitle}</strong></span>
          </div>
          <div class="details-row">
            <span class="details-label">Công ty:</span>
            <span class="details-value"><strong>${companyName}</strong></span>
          </div>
          <div class="details-row">
            <span class="details-label">Thời gian:</span>
            <span class="details-value" style="color: #00b14f; font-weight: 700;">${interviewTime}</span>
          </div>
        </div>

        ${
          notes
            ? '<div class="notes-box"><strong>Lưu ý từ nhà tuyển dụng:</strong><br/>' +
              notes.replace(/\\n/g, '<br/>') +
              '</div>'
            : ''
        }

        <p class="welcome-text" style="margin-top: 30px;">
          Vui lòng phản hồi email này để xác nhận sự tham gia của bạn. Nếu có bất kỳ câu hỏi nào khác, bạn có thể liên hệ trực tiếp với chúng tôi qua địa chỉ email này.
        </p>
        
        <p class="welcome-text">Chúc bạn chuẩn bị thật tốt và hẹn gặp lại bạn trong buổi phỏng vấn sắp tới!</p>
        
        <p class="welcome-text" style="margin-top: 30px; margin-bottom: 0;">
          Trân trọng,<br/>
          <strong>Bộ phận tuyển dụng ${companyName}</strong>
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} JobMatching. Tất cả các quyền được bảo lưu.</p>
        <p>Hệ thống kết nối việc làm thông minh và tiếp cận WCAG 2.2.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}
