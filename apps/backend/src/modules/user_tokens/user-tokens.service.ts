import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository, MoreThan } from 'typeorm';
import { BaseService } from '@/common/services/base-services';
import { ResponseHttp } from '@/common/utils/response.util';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { UserToken } from './entities/user-token.entity';
import { CreateUserTokenDto } from './dto/create-user-token.dto';

@Injectable({ scope: Scope.REQUEST })
export class UserTokensService extends BaseService {
  constructor(
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  async createOrUpdate(dto: CreateUserTokenDto): Promise<UserToken> {
    let tokenEntry = await this.userTokenRepository.findOne({
      where: { userId: dto.userId, deviceId: dto.deviceId },
    });

    if (tokenEntry) {
      tokenEntry.refreshToken = dto.refreshToken;
      tokenEntry.expiresAt = dto.expiresAt;
      this.setAuditForUpdate(tokenEntry);
    } else {
      tokenEntry = new UserToken();
      tokenEntry.userId = dto.userId;
      tokenEntry.deviceId = dto.deviceId;
      tokenEntry.refreshToken = dto.refreshToken;
      tokenEntry.expiresAt = dto.expiresAt;
      this.setAuditForCreate(tokenEntry);
    }

    return this.userTokenRepository.save(tokenEntry);
  }

  async findByToken(refreshToken: string): Promise<UserToken | null> {
    return this.userTokenRepository.findOne({
      where: {
        refreshToken,
        expiresAt: MoreThan(new Date()),
      },
      relations: { user: true },
    });
  }

  async removeByToken(refreshToken: string): Promise<void> {
    await this.userTokenRepository.delete({ refreshToken });
  }

  async removeByDeviceId(userId: number, deviceId: string): Promise<ResponseHttp<void>> {
    await this.userTokenRepository.delete({ userId, deviceId });
    return ResponseHttp.success({
      message: 'Đã thu hồi phiên đăng nhập của thiết bị thành công',
    });
  }

  async removeByUserId(userId: number): Promise<ResponseHttp<void>> {
    await this.userTokenRepository.delete({ userId });
    return ResponseHttp.success({
      message: 'Đã đăng xuất khỏi tất cả các thiết bị thành công',
    });
  }

  async findActiveSessions(userId: number): Promise<ResponseHttp<UserToken[]>> {
    const data = await this.userTokenRepository.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
      },
      order: {
        modifiedAt: 'DESC',
      },
    });
    return ResponseHttp.success({
      message: 'Lấy danh sách phiên đăng nhập hoạt động thành công',
      data,
    });
  }
}
