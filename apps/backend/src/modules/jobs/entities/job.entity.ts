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
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employer_id' })
  employer: User;

  @Column({ name: 'employer_id', type: 'integer' })
  employerId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id', type: 'integer' })
  companyId: number;

  @Column({ type: 'varchar', length: 300, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 300, unique: true, nullable: false })
  slug: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements?: string;

  @Column({ type: 'text', nullable: true })
  benefits?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  industry?: string;

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
    nullable: false,
  })
  jobType: JobType;

  @Column({
    name: 'experience_level',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  experienceLevel?: string;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({
    name: 'salary_min',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  salaryMin?: number;

  @Column({
    name: 'salary_max',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  salaryMax?: number;

  @Column({ name: 'is_salary_negotiable', type: 'boolean', default: false })
  isSalaryNegotiable: boolean;

  @Column({
    name: 'work_address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  workAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province?: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_urgent', type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ name: 'view_count', type: 'integer', default: 0 })
  viewCount: number;

  @Column({ name: 'application_count', type: 'integer', default: 0 })
  applicationCount: number;

  @Column({
    name: 'posting_start_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  postingStartAt: Date;

  @Column({ name: 'posting_end_at', type: 'timestamp', nullable: true })
  postingEndAt?: Date;

  @Column({ type: 'date', nullable: true })
  deadline?: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @OneToMany(() => JobSkill, (jobSkill) => jobSkill.job)
  skills: JobSkill[];
}
