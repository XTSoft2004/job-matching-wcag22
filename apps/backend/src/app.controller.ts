import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './modules/authenticator/decorators/public.decorator';

@ApiTags('Demo')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái hệ thống',
    description:
      'Trả về thông điệp chào mừng để kiểm tra kết nối hệ thống hoạt động.',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
