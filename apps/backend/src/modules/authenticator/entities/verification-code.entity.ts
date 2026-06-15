import { Entity, Column } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';

/**
 * Loại mã xác thực (Ví dụ: kích hoạt tài khoản hoặc reset mật khẩu).
 */
export enum VerificationCodeType {
  REGISTER_VERIFY = 'REGISTER_VERIFY',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

/**
 * Thực thể VerificationCode đại diện cho mã xác thực OTP gửi qua email.
 * Dùng để kiểm tra hợp lệ khi đăng ký tài khoản hoặc đổi mật khẩu.
 */
@Entity('verification_codes')
export class VerificationCode extends EntityBase {
  /**
   * Email nhận mã xác thực.
   */
  @Column({ name: 'email', type: 'varchar', length: 255, nullable: false })
  email: string;

  /**
   * Mã xác thực (OTP) dạng chuỗi mã hóa hoặc chuỗi số ngẫu nhiên.
   */
  @Column({ name: 'code', type: 'varchar', length: 255, nullable: false })
  code: string;

  /**
   * Mục đích của mã xác thực (kích hoạt đăng ký hoặc khôi phục mật khẩu).
   */
  @Column({
    name: 'type',
    type: 'enum',
    enum: VerificationCodeType,
    nullable: false,
  })
  /**
   * Loại mã xác thực hoặc phân loại đối tượng.
   */
  type: VerificationCodeType;

  /**
   * Thời hạn hiệu lực của mã xác thực.
   */
  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  expiresAt: Date;

  /**
   * Đánh dấu mã đã được người dùng sử dụng hay chưa.
   */
  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean;
}
