import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserTokenDto {
  @IsNumber({}, { message: 'User ID phải là số' })
  @IsNotEmpty({ message: 'User ID không được để trống' })
  userId: number;

  @IsString({ message: 'Refresh token phải là chuỗi' })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;

  @IsString({ message: 'Device ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Device ID không được để trống' })
  deviceId: string;

  @Type(() => Date)
  @IsDate({ message: 'Hạn sử dụng không đúng định dạng ngày tháng' })
  @IsNotEmpty({ message: 'Hạn sử dụng không được để trống' })
  expiresAt: Date;
}
