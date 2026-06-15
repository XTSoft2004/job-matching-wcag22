import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email tài khoản cần đặt lại mật khẩu',
    example: 'user@example.com',
  })
  /**
   * Địa chỉ email.
   */
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mã xác minh gồm 6 chữ số gửi qua email',
    example: '123456',
  })
  /**
   * Mã xác thực OTP hoặc mã liên kết.
   */
  @IsString({ message: 'Mã xác minh phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã xác minh không được để trống' })
  code: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'newpassword123',
    minLength: 6,
  })
  /**
   * Mật khẩu mới.
   */
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  newPassword: string;
}
