import { Controller, Get, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './modules/authenticator/decorators/public.decorator';
import { Response } from 'express';
import * as https from 'https';

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

  @Public()
  @Get('tts')
  @ApiOperation({
    summary: 'Proxy Google Translate TTS',
    description: 'Proxy Google Translate TTS to bypass CORS/Referrer blocks.',
  })
  proxyTts(@Query('q') text: string, @Res() res: any) {
    if (!text) {
      throw new HttpException('Text is required', HttpStatus.BAD_REQUEST);
    }
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=gtx`;

    https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      (proxyRes) => {
        if (proxyRes.statusCode !== 200) {
          res.status(HttpStatus.BAD_GATEWAY).send('Failed to fetch TTS audio');
          return;
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        proxyRes.pipe(res);
      },
    ).on('error', () => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('TTS Proxy error');
    });
  }
}
