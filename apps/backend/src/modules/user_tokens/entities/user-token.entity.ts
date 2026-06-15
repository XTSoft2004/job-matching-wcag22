import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Thực thể UserToken đại diện cho Refresh Token của người dùng.
 * Được sử dụng để quản lý phiên đăng nhập và gia hạn Access Token.
 */
@Entity('user_tokens')
@Index(['user', 'deviceId'], { unique: true })
export class UserToken extends EntityBase {
  /**
   * ID của người dùng sở hữu token.
   */
  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  /**
   * Liên kết đến thực thể User (Quan hệ N-1).
   * Khi User bị xóa, các tokens liên quan cũng tự động bị xóa (CASCADE).
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Chuỗi Refresh Token được lưu trữ (thường có kích thước lớn).
   */
  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 1500,
    nullable: false,
  })
  refreshToken: string;

  /**
   * ID nhận diện thiết bị đăng nhập của người dùng.
   */
  @Column({ name: 'device_id', type: 'varchar', length: 255, nullable: false })
  deviceId: string;

  /**
   * Thời gian hết hạn của Refresh Token.
   */
  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  expiresAt: Date;
}
