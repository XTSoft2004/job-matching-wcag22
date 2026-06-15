import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from './tokens/response/jwt-info.response';
import { UsersService } from '@/modules/users/users.service';
import { UserTokensService } from '@/modules/user_tokens/user-tokens.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HashUtil } from '@/common/utils/hash.util';
import { User, UserStatus } from '@/modules/users/entities/user.entity';
import { UserResponse } from '@/modules/users/response/users.response';
import { ResponseHttp } from '@/common/utils/response.util';
import {
  VerificationCode,
  VerificationCodeType,
} from './entities/verification-code.entity';
import { MailService } from '@/common/services/mail.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthService extends BaseService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTokensService: UserTokensService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly mailService: MailService,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  async register(dto: RegisterDto): Promise<ResponseHttp<void>> {
    const user = await this.usersService.createRaw({
      ...dto,
      status: UserStatus.INACTIVE,
    });

    // Generate code
    const code = await this.createVerificationCode(
      user.email,
      VerificationCodeType.REGISTER_VERIFY,
    );

    // Send email
    await this.mailService.sendVerificationCode(user.email, code);

    return ResponseHttp.success({
      message: 'Đăng ký tài khoản thành công',
    });
  }

  async login(dto: LoginDto): Promise<ResponseHttp<{
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
  }>> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Check status
    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Tài khoản đã bị tạm khóa');
    }
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('Tài khoản đã bị cấm truy cập');
    }

    // Compare password
    const isPasswordValid = await HashUtil.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Default device ID if not provided
    const deviceId = dto.deviceId || 'unknown-device';

    // Generate token pair
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      deviceId,
    );

    // Decode refresh token to get exact expires_at
    const decoded = this.jwtService.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // Save refresh token to DB
    await this.userTokensService.createOrUpdate({
      userId: user.id,
      deviceId,
      refreshToken,
      expiresAt,
    });

    // Update last login timestamp
    user.lastLoginAt = new Date();
    const updatedUser = await this.usersService.updateRaw(user.id, {
      lastLoginAt: user.lastLoginAt,
    } as any);

    return ResponseHttp.success({
      message: 'Đăng nhập thành công',
      data: { accessToken, refreshToken, user: updatedUser },
    });
  }

  async refresh(
    dto: RefreshDto,
  ): Promise<ResponseHttp<{ accessToken: string; refreshToken: string }>> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    // Check if refresh token exists in DB
    const savedToken = await this.userTokensService.findByToken(
      dto.refreshToken,
    );
    if (
      !savedToken ||
      savedToken.deviceId !== dto.deviceId ||
      savedToken.userId !== payload.id
    ) {
      throw new UnauthorizedException(
        'Phiên đăng nhập không tồn tại hoặc không khớp thiết bị',
      );
    }

    // Get user to verify active status
    const userResponse = await this.usersService.findOne(payload.id);
    const user = userResponse.data;
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Tài khoản đã bị tạm khóa');
    }
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('Tài khoản đã bị cấm truy cập');
    }

    // Generate new token pair (rotation) — use raw user for JWT payload
    const rawUser = await this.usersService.findByEmail(user.email);
    if (!rawUser) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(rawUser, dto.deviceId);

    // Get new expiration
    const decoded = this.jwtService.decode(newRefreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // Update token in DB
    await this.userTokensService.createOrUpdate({
      userId: user.id,
      deviceId: dto.deviceId,
      refreshToken: newRefreshToken,
      expiresAt,
    });

    return ResponseHttp.success({
      message: 'Làm mới token thành công',
      data: { accessToken, refreshToken: newRefreshToken },
    });
  }

  async logout(refreshToken: string): Promise<ResponseHttp<void>> {
    await this.userTokensService.removeByToken(refreshToken);
    return ResponseHttp.success({
      message: 'Đăng xuất thành công',
    });
  }

  async getMe(userId: number): Promise<ResponseHttp<UserResponse>> {
    const userResponse = await this.usersService.findOne(userId);
    return ResponseHttp.success({
      message: 'Lấy thông tin cá nhân thành công',
      data: userResponse.data,
    });
  }

  private async generateTokens(user: User, deviceId: string) {
    const payload = {
      id: user.id,
      sub: user.id.toString(),
      username: user.email,
      role: user.role,
      deviceId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiration') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>(
          'jwt.refreshExpiration',
        ) as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccountToken(token: string): Promise<void> {
    const record = await this.verificationCodeRepository.findOne({
      where: {
        code: token,
        type: VerificationCodeType.REGISTER_VERIFY,
        isUsed: false,
      },
    });

    if (!record) {
      throw new UnauthorizedException(
        'Liên kết xác minh không hợp lệ hoặc đã được sử dụng',
      );
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Liên kết xác minh đã hết hạn');
    }

    record.isUsed = true;
    this.setAuditForUpdate(record);
    await this.verificationCodeRepository.save(record);

    const user = await this.usersService.findByEmail(record.email);
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    user.emailVerified = true;
    user.status = UserStatus.ACTIVE;
    this.setAuditForUpdate(user);
    await this.usersService.updateRaw(user.id, {
      emailVerified: true,
      status: UserStatus.ACTIVE,
    } as any);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ResponseHttp<void>> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return ResponseHttp.success({
        message:
          'Nếu email tồn tại trên hệ thống, một liên kết khôi phục sẽ được gửi đi',
      });
    }

    const token = await this.createVerificationCode(
      dto.email,
      VerificationCodeType.PASSWORD_RESET,
    );
    await this.mailService.sendForgotPasswordCode(dto.email, token);

    return ResponseHttp.success({
      message: 'Liên kết khôi phục mật khẩu đã được gửi đến email của bạn',
    });
  }

  async validateResetToken(token: string): Promise<string> {
    const record = await this.verificationCodeRepository.findOne({
      where: {
        code: token,
        type: VerificationCodeType.PASSWORD_RESET,
        isUsed: false,
      },
    });

    if (!record) {
      throw new UnauthorizedException(
        'Liên kết khôi phục mật khẩu không hợp lệ hoặc đã được sử dụng',
      );
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Liên kết khôi phục mật khẩu đã hết hạn');
    }

    return record.email;
  }

  async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const email = await this.validateResetToken(token);

    await this.verificationCodeRepository.update(
      { code: token, type: VerificationCodeType.PASSWORD_RESET },
      { isUsed: true },
    );

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    const passwordHash = await HashUtil.hash(newPassword);
    await this.usersService.updateRaw(user.id, { passwordHash } as any);
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<ResponseHttp<void>> {
    const userResponse = await this.usersService.findOne(userId);
    const user = userResponse.data;
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    // Need raw user entity to compare password
    const rawUser = await this.usersService.findByEmail(user.email);
    if (!rawUser) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    const isPasswordValid = await HashUtil.compare(
      dto.currentPassword,
      rawUser.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    const passwordHash = await HashUtil.hash(dto.newPassword);
    await this.usersService.updateRaw(userId, { passwordHash } as any);
    return ResponseHttp.success({
      message: 'Đổi mật khẩu thành công',
    });
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<ResponseHttp<void>> {
    const record = await this.verificationCodeRepository.findOne({
      where: {
        code: dto.code,
        type: VerificationCodeType.REGISTER_VERIFY,
        isUsed: false,
      },
    });

    if (!record || record.email !== dto.email) {
      throw new UnauthorizedException(
        'Mã xác minh không hợp lệ hoặc không trùng khớp với email',
      );
    }

    await this.verifyAccountToken(dto.code);
    return ResponseHttp.success({
      message: 'Xác minh tài khoản thành công',
    });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ResponseHttp<void>> {
    const record = await this.verificationCodeRepository.findOne({
      where: {
        code: dto.code,
        type: VerificationCodeType.PASSWORD_RESET,
        isUsed: false,
      },
    });

    if (!record || record.email !== dto.email) {
      throw new UnauthorizedException(
        'Mã xác minh không hợp lệ hoặc không trùng khớp với email',
      );
    }

    await this.resetPasswordWithToken(dto.code, dto.newPassword);
    return ResponseHttp.success({
      message: 'Đặt lại mật khẩu thành công',
    });
  }

  private async createVerificationCode(
    email: string,
    type: VerificationCodeType,
  ): Promise<string> {
    // Mark previous active codes of this type as used
    await this.verificationCodeRepository.update(
      { email, type, isUsed: false },
      { isUsed: true },
    );

    // Generate secure random 6-digit code
    const token = crypto.randomInt(100000, 1000000).toString();

    // Expire in 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const verificationCode = new VerificationCode();
    verificationCode.email = email;
    verificationCode.code = token;
    verificationCode.type = type;
    verificationCode.expiresAt = expiresAt;

    this.setAuditForCreate(verificationCode);
    await this.verificationCodeRepository.save(verificationCode);

    return token;
  }
}
