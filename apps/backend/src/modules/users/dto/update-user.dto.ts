import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email mới của người dùng',
    example: 'newuser@example.com',
  })
  /**
   * Địa chỉ email.
   */
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Mật khẩu mới',
    example: 'newpassword123',
    minLength: 6,
  })
  /**
   * Mật khẩu đăng nhập.
   */
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Họ và tên đầy đủ',
    example: 'Nguyễn Văn A',
  })
  /**
   * Họ và tên đầy đủ.
   */
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại mới',
    example: '0912345678',
  })
  /**
   * Số điện thoại liên hệ.
   */
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn URL của ảnh đại diện',
    example: 'https://example.com/avatar.jpg',
  })
  /**
   * Đường dẫn URL ảnh đại diện.
   */
  @IsString({ message: 'URL ảnh đại diện phải là chuỗi' })
  @IsOptional()
  avatarUrl?: string;

  /**
   * Vai trò người dùng
   */
  @ApiPropertyOptional({ description: 'Vai trò người dùng', enum: UserRole })
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Trạng thái tài khoản',
    enum: UserStatus,
  })
  /**
   * Trạng thái hoạt động hoặc trạng thái xử lý.
   */
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: UserStatus;
}
