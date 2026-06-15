import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email tài khoản cần xác minh',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mã xác minh gồm 6 chữ số gửi qua email',
    example: '123456',
  })
  @IsString({ message: 'Mã xác minh phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã xác minh không được để trống' })
  code: string;
}
