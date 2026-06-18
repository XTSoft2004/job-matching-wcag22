import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { Company } from '@/modules/companies/entities/company.entity';

/**
 * Phân quyền vai trò người dùng trong hệ thống.
 */
export enum UserRole {
  CANDIDATE = 'Ứng viên',
  EMPLOYER = 'Nhà tuyển dụng',
  ADMIN = 'Quản trị viên',
}

/**
 * Trạng thái hoạt động của tài khoản người dùng.
 */
export enum UserStatus {
  ACTIVE = 'Hoạt động',
  INACTIVE = 'Tạm khóa',
  BANNED = 'Bị cấm',
}

/**
 * Thực thể User đại diện cho tài khoản người dùng hệ thống.
 * Chứa thông tin đăng nhập cốt lõi và thông tin phân quyền.
 */
@Entity('users')
export class User extends EntityBase {
  /**
   * Địa chỉ email đăng nhập (phải là duy nhất).
   */
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  /**
   * Địa chỉ email.
   */
  email: string;

  /**
   * Mật khẩu đã mã hóa của người dùng.
   */
  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  /**
   * Mật khẩu đã mã hóa.
   */
  passwordHash: string;

  /**
   * Họ và tên đầy đủ của người dùng.
   */
  @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: false })
  fullName: string;

  /**
   * Số điện thoại liên hệ (tùy chọn).
   */
  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone?: string;

  /**
   * Đường dẫn ảnh đại diện (avatar) của người dùng (tùy chọn).
   */
  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  /**
   * Getter ảo để truy cập bằng trường 'avatar'.
   */
  get avatar(): string | undefined {
    return this.avatarUrl;
  }

  /**
   * Setter ảo để gán cho trường 'avatar'.
   */
  set avatar(value: string | undefined) {
    this.avatarUrl = value;
  }

  /**
   * Vai trò của tài khoản (mặc định là CANDIDATE).
   */
  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  /**
   * Vai trò người dùng trong hệ thống (Ứng viên, Nhà tuyển dụng, Admin).
   */
  role: UserRole;

  /**
   * Trạng thái hoạt động của tài khoản (mặc định là ACTIVE).
   */
  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  /**
   * Trạng thái hoạt động hoặc trạng thái xử lý.
   */
  status: UserStatus;

  /**
   * Đánh dấu email đã được xác thực hay chưa.
   */
  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  /**
   * Thời gian lần cuối cùng người dùng đăng nhập hệ thống.
   */
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  /**
   * Liên kết đến thực thể Company (chỉ dành cho Employer).
   * Khi công ty bị xóa, liên kết này sẽ được đặt thành NULL.
   */
  @ManyToOne(() => Company, (company) => company.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  /**
   * Thông tin công ty liên kết.
   */
  @JoinColumn({ name: 'company_id' })
  company?: Company | null;

  /**
   * ID của công ty liên kết.
   */
  @Column({ name: 'company_id', type: 'integer', nullable: true })
  companyId?: number | null;
}
