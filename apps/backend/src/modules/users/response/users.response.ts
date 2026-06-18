import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { UserRole, UserStatus } from '../entities/user.entity';

/**
 * Response DTO for User — excludes passwordHash and internal audit fields.
 */
export class UserResponse extends BaseResponse {
  /**
   * Địa chỉ email.
   */
  @Expose()
  email: string;

  /**
   * Họ và tên đầy đủ.
   */
  @Expose()
  fullName: string;

  /**
   * Số điện thoại liên hệ.
   */
  @Expose()
  phone?: string;

  /**
   * Đường dẫn URL ảnh đại diện.
   */
  @Expose()
  avatarUrl?: string;

  /**
   * Ảnh đại diện (alias cho avatarUrl).
   */
  @Expose()
  get avatar(): string | undefined {
    return this.avatarUrl;
  }

  /**
   * Vai trò người dùng trong hệ thống (Ứng viên, Nhà tuyển dụng, Admin).
   */
  @Expose()
  role: UserRole;

  /**
   * Trạng thái hoạt động hoặc trạng thái xử lý.
   */
  @Expose()
  status: UserStatus;

  /**
   * Trạng thái xác thực email (đã xác thực hay chưa).
   */
  @Expose()
  emailVerified: boolean;

  /**
   * Thời gian đăng nhập gần nhất.
   */
  @Expose()
  lastLoginAt?: Date;

  /**
   * ID của công ty liên kết.
   */
  @Expose()
  companyId?: number | null;
}

export type UserPaginatedResponse = ResponseHttp<UserResponse[]>;

