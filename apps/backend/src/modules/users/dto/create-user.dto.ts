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
  /**
   * Địa chỉ email.
   */
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'password123',
    minLength: 6,
  })
  /**
   * Mật khẩu đăng nhập.
   */
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  /**
   * Họ và tên đầy đủ
   */
  @ApiProperty({ description: 'Họ và tên đầy đủ', example: 'Nguyễn Văn A' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    example: '0912345678',
  })
  /**
   * Số điện thoại liên hệ.
   */
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Vai trò của người dùng',
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  /**
   * Vai trò người dùng trong hệ thống (Ứng viên, Nhà tuyển dụng, Admin).
   */
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  role?: UserRole;

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

  @ApiPropertyOptional({
    description: 'Ảnh đại diện (alias cho avatarUrl)',
    example: 'https://example.com/avatar.jpg',
  })
  /**
   * Ảnh đại diện.
   */
  @IsString({ message: 'Ảnh đại diện phải là chuỗi' })
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái tài khoản',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  /**
   * Trạng thái hoạt động hoặc trạng thái xử lý.
   */
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: UserStatus;
}
