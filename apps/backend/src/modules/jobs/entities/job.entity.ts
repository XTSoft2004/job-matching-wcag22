import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { JobSkill } from '@/modules/job_skills/entities/job-skill.entity';

export enum JobType {
  FULL_TIME = 'Toàn thời gian',
  PART_TIME = 'Bán thời gian',
  REMOTE = 'Làm từ xa',
  FREELANCE = 'Freelance',
  INTERN = 'Thực tập',
}

export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
}

@Entity('jobs')
export class Job extends EntityBase {
  /**
   * Thông tin nhà tuyển dụng.
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employer_id' })
  employer: User;

  /**
   * ID nhà tuyển dụng đăng tin.
   */
  @Column({ name: 'employer_id', type: 'integer' })
  employerId: number;

  /**
   * Thông tin công ty liên kết.
   */
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /**
   * ID của công ty liên kết.
   */
  @Column({ name: 'company_id', type: 'integer' })
  companyId: number;

  /**
   * Tiêu đề công việc, hồ sơ hoặc tin đăng.
   */
  @Column({ type: 'varchar', length: 300, nullable: false })
  title: string;

  /**
   * Đường dẫn thân thiện phục vụ SEO.
   */
  @Column({ type: 'varchar', length: 300, unique: true, nullable: false })
  slug: string;

  /**
   * Mô tả chi tiết công việc hoặc nội dung.
   */
  @Column({ type: 'text', nullable: false })
  description: string;

  /**
   * Yêu cầu công việc đối với ứng viên.
   */
  @Column({ type: 'text', nullable: true })
  requirements?: string;

  /**
   * Quyền lợi ứng viên được hưởng.
   */
  @Column({ type: 'text', nullable: true })
  benefits?: string;

  /**
   * Lĩnh vực hoặc ngành nghề kinh doanh.
   */
  @Column({ type: 'varchar', length: 150, nullable: true })
  industry?: string;

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
    nullable: false,
  })
  /**
   * Loại hình công việc (Toàn thời gian, Bán thời gian, v.v.).
   */
  jobType: JobType;

  @Column({
    name: 'experience_level',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  /**
   * Cấp bậc kinh nghiệm yêu cầu.
   */
  experienceLevel?: string;

  /**
   * Số lượng cần tuyển dụng.
   */
  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({
    name: 'salary_min',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  /**
   * Mức lương tối thiểu (VND).
   */
  salaryMin?: number;

  @Column({
    name: 'salary_max',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  /**
   * Mức lương tối đa (VND).
   */
  salaryMax?: number;

  /**
   * Lương có thể thỏa thuận hay không.
   */
  @Column({ name: 'is_salary_negotiable', type: 'boolean', default: false })
  isSalaryNegotiable: boolean;

  @Column({
    name: 'work_address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  /**
   * Địa chỉ nơi làm việc cụ thể.
   */
  workAddress?: string;

  /**
   * Tỉnh/Thành phố nơi làm việc.
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  province?: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  /**
   * Trạng thái hoạt động hoặc trạng thái xử lý.
   */
  status: JobStatus;

  /**
   * Tin tuyển dụng có được làm nổi bật không.
   */
  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  /**
   * Tin tuyển dụng có tuyển gấp không.
   */
  @Column({ name: 'is_urgent', type: 'boolean', default: false })
  isUrgent: boolean;

  /**
   * Số lượt xem tin tuyển dụng.
   */
  @Column({ name: 'view_count', type: 'integer', default: 0 })
  viewCount: number;

  /**
   * Số lượng hồ sơ đã ứng tuyển.
   */
  @Column({ name: 'application_count', type: 'integer', default: 0 })
  applicationCount: number;

  @Column({
    name: 'posting_start_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  /**
   * Thời điểm bắt đầu hiển thị tin.
   */
  postingStartAt: Date;

  /**
   * Thời điểm kết thúc hiển thị tin.
   */
  @Column({ name: 'posting_end_at', type: 'timestamp', nullable: true })
  postingEndAt?: Date;

  /**
   * Hạn chót nộp hồ sơ ứng tuyển.
   */
  @Column({ type: 'date', nullable: true })
  deadline?: Date;

  /**
   * Thời điểm xuất bản tin tuyển dụng.
   */
  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  /**
   * Danh sách kỹ năng chuyên môn.
   */
  @OneToMany(() => JobSkill, (jobSkill) => jobSkill.job)
  skills: JobSkill[];
}
