import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserTokenDto {
  /**
   * ID tài khoản người dùng.
   */
  @IsNumber({}, { message: 'User ID phải là số' })
  @IsNotEmpty({ message: 'User ID không được để trống' })
  userId: number;

  /**
   * Token làm mới phiên đăng nhập.
   */
  @IsString({ message: 'Refresh token phải là chuỗi' })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;

  /**
   * Mã định danh thiết bị đăng nhập.
   */
  @IsString({ message: 'Device ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Device ID không được để trống' })
  deviceId: string;

  /**
   * Thời gian hết hạn của token hoặc mã xác thực.
   */
  @Type(() => Date)
  @IsDate({ message: 'Hạn sử dụng không đúng định dạng ngày tháng' })
  @IsNotEmpty({ message: 'Hạn sử dụng không được để trống' })
  expiresAt: Date;
}
