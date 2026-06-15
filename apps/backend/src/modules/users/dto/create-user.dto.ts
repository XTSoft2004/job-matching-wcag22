import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ description: 'Họ và tên đầy đủ', example: 'Nguyễn Văn A' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    example: '0912345678',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Vai trò của người dùng',
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Trạng thái tài khoản',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: UserStatus;
}
