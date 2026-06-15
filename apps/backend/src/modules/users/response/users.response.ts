import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { UserRole, UserStatus } from '../entities/user.entity';

/**
 * Response DTO for User — excludes passwordHash and internal audit fields.
 */
export class UserResponse extends BaseResponse {
  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  phone?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  role: UserRole;

  @Expose()
  status: UserStatus;

  @Expose()
  emailVerified: boolean;

  @Expose()
  lastLoginAt?: Date;

  @Expose()
  companyId?: number | null;
}

export type UserPaginatedResponse = ResponseHttp<UserResponse[]>;

