import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { Job } from '@/modules/jobs/entities/job.entity';

/**
 * Thực thể JobSkill lưu trữ thông tin kỹ năng chuyên môn yêu cầu của tin tuyển dụng.
 * Không phụ thuộc vào danh mục kỹ năng hệ thống, lưu trực tiếp tên và khoảng kinh nghiệm yêu cầu.
 */
@Entity('job_skills')
@Unique(['jobId', 'name'])
export class JobSkill extends EntityBase {
  /**
   * Liên kết đến tin tuyển dụng yêu cầu kỹ năng này (Quan hệ N-1).
   * Khi tin tuyển dụng bị xóa, các kỹ năng liên quan sẽ tự động bị xóa (CASCADE).
   */
  @ManyToOne(() => Job, (job) => job.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  /**
   * ID tin tuyển dụng liên kết.
   */
  @Column({ name: 'job_id', type: 'integer' })
  jobId: number;

  /**
   * Tên kỹ năng chuyên môn (ví dụ: 'NodeJS', 'React', 'Figma').
   */
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  /**
   * Số năm kinh nghiệm tối thiểu yêu cầu.
   */
  @Column({ name: 'experience_start', type: 'integer', nullable: true })
  experienceStart?: number;

  /**
   * Số năm kinh nghiệm tối đa yêu cầu.
   */
  @Column({ name: 'experience_end', type: 'integer', nullable: true })
  experienceEnd?: number;
}
