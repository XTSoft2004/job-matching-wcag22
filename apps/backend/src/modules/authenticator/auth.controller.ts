import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Header,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JWTInfoResponse } from './tokens/response/jwt-info.response';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { UserResponse } from '@/modules/users/response/users.response';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản',
    description: 'Đăng ký tài khoản người dùng mới (chờ xác thực email).',
  })
  async register(@Body() registerDto: RegisterDto): Promise<ResponseHttp<void>> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập hệ thống',
    description:
      'Xác thực tài khoản và cấp Access Token & Refresh Token kèm thông tin Device ID.',
  })
  async login(@Body() loginDto: LoginDto): Promise<ResponseHttp<any>> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Làm mới mã thông báo (Refresh Token)',
    description: 'Sử dụng Refresh Token để cấp lại Access Token mới.',
  })
  async refresh(@Body() refreshDto: RefreshDto): Promise<ResponseHttp<any>> {
    return this.authService.refresh(refreshDto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng xuất tài khoản',
    description: 'Đăng xuất tài khoản bằng cách thu hồi Refresh Token.',
  })
  async logout(@Body('refreshToken') refreshToken: string): Promise<ResponseHttp<void>> {
    return this.authService.logout(refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Yêu cầu khôi phục mật khẩu',
    description: 'Gửi liên kết đặt lại mật khẩu tới email của người dùng.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ResponseHttp<void>> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gửi lại mã xác minh email',
    description:
      'Gửi lại mã xác minh qua email cho tài khoản chưa được kích hoạt.',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<ResponseHttp<void>> {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đặt lại mật khẩu (API)',
    description:
      'Sử dụng token đặt lại mật khẩu được nhận từ email để đổi mật khẩu qua API.',
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResponseHttp<void>> {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Get('verify-account')
  @Header('Content-Type', 'text/html')
  @ApiOperation({
    summary: 'Trang xác minh tài khoản (HTML)',
    description: 'Đường dẫn xác minh tài khoản qua email dạng giao diện HTML.',
  })
  async verifyAccount(@Query('token') token: string): Promise<string> {
    try {
      await this.authService.verifyAccountToken(token);
      return this.getHtmlWrapper(
        'Xác minh tài khoản thành công',
        `
        <div class="icon success">✓</div>
        <h2>Xác minh thành công</h2>
        <p>Cảm ơn bạn! Tài khoản của bạn đã được xác minh và kích hoạt thành công trên hệ thống JobMatching.</p>
        <a href="#" class="btn">Đăng nhập ngay</a>
        `,
      );
    } catch (error) {
      return this.getHtmlWrapper(
        'Xác minh tài khoản thất bại',
        `
        <div class="icon error">✗</div>
        <h2>Xác minh thất bại</h2>
        <p>${error.message || 'Liên kết xác minh không hợp lệ hoặc đã hết hạn.'}</p>
        <a href="#" class="btn secondary">Quay lại trang chủ</a>
        `,
      );
    }
  }

  @Public()
  @Get('reset-password-page')
  @Header('Content-Type', 'text/html')
  @ApiOperation({
    summary: 'Trang đặt lại mật khẩu (HTML)',
    description: 'Hiển thị form nhập mật khẩu mới dạng giao diện HTML.',
  })
  async resetPasswordPage(@Query('token') token: string): Promise<string> {
    try {
      // Validate token first to show immediate error page if expired/invalid
      await this.authService.validateResetToken(token);

      return this.getHtmlWrapper(
        'Đặt lại mật khẩu',
        `
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhập mật khẩu mới cho tài khoản của bạn bên dưới.</p>
        <form id="resetForm" action="./reset-password-submit" method="POST" onsubmit="return validateForm()">
          <input type="hidden" name="token" value="${token}">
          <div class="input-group">
            <label for="password">Mật khẩu mới</label>
            <input type="password" id="password" name="password" placeholder="Tối thiểu 6 ký tự" required minlength="6">
          </div>
          <div class="input-group">
            <label for="confirmPassword">Xác nhận mật khẩu</label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Nhập lại mật khẩu mới" required minlength="6">
          </div>
          <button type="submit" class="btn" style="margin-top: 10px;">Xác nhận đổi mật khẩu</button>
        </form>
        <script>
          function validateForm() {
            var p = document.getElementById('password').value;
            var cp = document.getElementById('confirmPassword').value;
            if (p !== cp) {
              alert('Mật khẩu xác nhận không khớp. Vui lòng nhập lại!');
              return false;
            }
            return true;
          }
        </script>
        `,
      );
    } catch (error) {
      return this.getHtmlWrapper(
        'Liên kết không hợp lệ',
        `
        <div class="icon error">✗</div>
        <h2>Liên kết không hợp lệ</h2>
        <p>${error.message || 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không tồn tại.'}</p>
        <a href="#" class="btn secondary">Quay lại trang chủ</a>
        `,
      );
    }
  }

  @Public()
  @Post('reset-password-submit')
  @Header('Content-Type', 'text/html')
  @ApiOperation({
    summary: 'Xử lý gửi form đặt lại mật khẩu',
    description: 'Nhận thông tin từ form HTML để tiến hành đổi mật khẩu mới.',
  })
  async resetPasswordSubmit(@Body() body: any): Promise<string> {
    try {
      const { token, password } = body;
      if (!token || !password) {
        throw new Error('Thiếu thông tin yêu cầu đặt lại mật khẩu.');
      }
      await this.authService.resetPasswordWithToken(token, password);

      return this.getHtmlWrapper(
        'Đổi mật khẩu thành công',
        `
        <div class="icon success">✓</div>
        <h2>Đổi mật khẩu thành công</h2>
        <p>Mật khẩu của bạn đã được cập nhật thành công. Bạn đã có thể đăng nhập bằng mật khẩu mới.</p>
        <a href="#" class="btn">Đăng nhập ngay</a>
        `,
      );
    } catch (error) {
      return this.getHtmlWrapper(
        'Lỗi đặt lại mật khẩu',
        `
        <div class="icon error">✗</div>
        <h2>Đặt lại mật khẩu thất bại</h2>
        <p>${error.message || 'Đã có lỗi xảy ra trong quá trình đặt lại mật khẩu.'}</p>
        <a href="#" class="btn secondary">Thử lại sau</a>
        `,
      );
    }
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản hiện tại',
    description: 'Lấy thông tin chi tiết của người dùng đang đăng nhập từ JWT.',
  })
  async getMe(@CurrentUser() user: JWTInfoResponse): Promise<ResponseHttp<UserResponse>> {
    return this.authService.getMe(user.id);
  }

  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đổi mật khẩu tài khoản',
    description: 'Cho phép người dùng đã đăng nhập đổi mật khẩu hiện tại.',
  })
  async changePassword(
    @CurrentUser() user: JWTInfoResponse,
    @Body() dto: ChangePasswordDto,
  ): Promise<ResponseHttp<void>> {
    return this.authService.changePassword(user.id, dto);
  }


  private getHtmlWrapper(title: string, bodyContent: string): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - JobMatching</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --success: #10b981;
      --error: #ef4444;
      --bg: #f8fafc;
      --card-bg: rgba(255, 255, 255, 0.8);
      --text: #0f172a;
      --text-muted: #64748b;
    }
    body {
      font-family: 'Outfit', sans-serif;
      background: radial-gradient(circle at 50% 50%, #eef2ff 0%, #f8fafc 100%);
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: var(--text);
    }
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 40px rgba(99, 102, 241, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
      text-align: center;
      box-sizing: border-box;
      margin: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 25px;
      letter-spacing: -0.5px;
    }
    h2 {
      font-size: 22px;
      font-weight: 700;
      margin: 10px 0 20px 0;
      color: #1e293b;
    }
    p {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 22px;
      margin-bottom: 30px;
    }
    .icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
      font-size: 32px;
    }
    .icon.success {
      background-color: #d1fae5;
      color: var(--success);
    }
    .icon.error {
      background-color: #fee2e2;
      color: var(--error);
    }
    .input-group {
      text-align: left;
      margin-bottom: 20px;
    }
    .input-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #475569;
    }
    .input-group input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      font-size: 15px;
      font-family: inherit;
      box-sizing: border-box;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.9);
    }
    .input-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
    }
    .btn {
      display: inline-block;
      width: 100%;
      background: linear-gradient(135deg, var(--primary), #3b82f6);
      color: #ffffff;
      border: none;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
      transition: all 0.2s ease;
      text-decoration: none;
      box-sizing: border-box;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
    }
    .btn:active {
      transform: translateY(0);
    }
    .btn.secondary {
      background: #ffffff;
      color: #475569;
      border: 1px solid #e2e8f0;
      box-shadow: none;
    }
    .btn.secondary:hover {
      background: #f8fafc;
      box-shadow: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">JobMatching</div>
    ${bodyContent}
  </div>
</body>
</html>
    `;
  }
}
