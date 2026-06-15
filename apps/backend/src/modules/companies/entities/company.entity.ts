import { Entity, Column, OneToMany } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Thực thể Company đại diện cho thông tin công ty, doanh nghiệp.
 * Liên kết với các nhà tuyển dụng thuộc công ty đó.
 */
@Entity('companies')
export class Company extends EntityBase {
  /**
   * Tên thương hiệu/tên pháp nhân của công ty.
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  /**
   * Đường dẫn URL đến file ảnh logo công ty (tùy chọn).
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string | null;

  /**
   * Địa chỉ website chính thức của công ty (tùy chọn).
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string | null;

  /**
   * Địa chỉ trụ sở giao dịch/đăng ký kinh doanh (tùy chọn).
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string | null;

  /**
   * Nội dung giới thiệu chi tiết về công ty (tùy chọn).
   */
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  /**
   * Quy mô nhân sự của công ty (ví dụ: '100-500 nhân viên') (tùy chọn).
   */
  @Column({
    name: 'company_size',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  /**
   * Quy mô nhân sự của công ty.
   */
  companySize?: string | null;

  /**
   * Danh sách tài khoản người dùng (Employer) trực thuộc công ty này.
   */
  @OneToMany(() => User, (user) => user.company)
  users: User[];
}
