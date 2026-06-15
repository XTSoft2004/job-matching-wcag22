import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserTokensService } from './user-tokens.service';
import { JwtAuthGuard } from '@/modules/authenticator/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/authenticator/decorators/current-user.decorator';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { UserToken } from './entities/user-token.entity';

@ApiTags('User Tokens')
@ApiBearerAuth()
@Controller('user-tokens')
@UseGuards(JwtAuthGuard)
export class UserTokensController {
  constructor(private readonly userTokensService: UserTokensService) {}

  @Get('active')
  @ApiOperation({
    summary: 'Lấy danh sách phiên đăng nhập hoạt động',
    description:
      'Trả về danh sách các thiết bị/phiên làm việc đang hoạt động của người dùng hiện tại.',
  })
  async getActiveSessions(
    @CurrentUser() user: JWTInfoResponse,
  ): Promise<ResponseHttp<UserToken[]>> {
    return this.userTokensService.findActiveSessions(user.id);
  }

  @Delete('revoke/:deviceId')
  @ApiOperation({
    summary: 'Thu hồi phiên đăng nhập của thiết bị',
    description:
      'Đăng xuất một thiết bị cụ thể bằng cách xóa token dựa trên Device ID.',
  })
  async revokeDevice(
    @CurrentUser() user: JWTInfoResponse,
    @Param('deviceId') deviceId: string,
  ): Promise<ResponseHttp<void>> {
    return this.userTokensService.removeByDeviceId(user.id, deviceId);
  }

  @Delete('revoke-all')
  @ApiOperation({
    summary: 'Đăng xuất tất cả thiết bị',
    description:
      'Đăng xuất khỏi tất cả các thiết bị đang hoạt động bằng cách xóa mọi token hiện tại của người dùng.',
  })
  async revokeAll(@CurrentUser() user: JWTInfoResponse): Promise<ResponseHttp<void>> {
    return this.userTokensService.removeByUserId(user.id);
  }
}

