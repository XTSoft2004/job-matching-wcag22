import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  /**
   * Mật khẩu hiện tại
   */
  @ApiProperty({ description: 'Mật khẩu hiện tại', minLength: 6 })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @MinLength(6, { message: 'Mật khẩu hiện tại phải chứa ít nhất 6 ký tự' })
  currentPassword: string;

  /**
   * Mật khẩu mới
   */
  @ApiProperty({ description: 'Mật khẩu mới', minLength: 6 })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' })
  newPassword: string;
}
