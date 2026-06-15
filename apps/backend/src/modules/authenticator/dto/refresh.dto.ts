import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({
    description: 'Mã refresh token của phiên đăng nhập',
    example: 'eyJhbGciOiJIUzI1NiIsIn...',
  })
  @IsString({ message: 'Refresh token phải là chuỗi' })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;

  @ApiProperty({
    description: 'Mã định danh thiết bị thực hiện refresh',
    example: 'chrome-windows',
  })
  @IsString({ message: 'Mã định danh thiết bị phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã định danh thiết bị không được để trống' })
  deviceId: string;
}
