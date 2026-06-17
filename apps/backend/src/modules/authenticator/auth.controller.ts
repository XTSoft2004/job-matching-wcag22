import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
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
  constructor(private readonly authService: AuthService) { }

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
    description: 'Gửi mã xác minh khôi phục mật khẩu tới email của người dùng.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ResponseHttp<void>> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xác minh email tài khoản bằng mã OTP',
    description:
      'Xác minh tài khoản sử dụng mã số OTP 6 chữ số gửi qua email.',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<ResponseHttp<void>> {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đặt lại mật khẩu mới (API)',
    description:
      'Sử dụng mã khôi phục mật khẩu nhận từ email để đổi mật khẩu qua API.',
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResponseHttp<void>> {
    return this.authService.resetPassword(dto);
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
}
