import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { Job } from '@/modules/jobs/entities/job.entity';
import { CandidateCv } from '@/modules/candidate/candidate_cvs/entities/candidate-cv.entity';
import { CandidateProfile } from '@/modules/candidate/candidate_profiles/entities/candidate-profile.entity';

/**
 * Trạng thái của đơn ứng tuyển.
 */
export enum ApplicationStatus {
  SUBMITTED = 'Đã nộp',
  REVIEWING = 'Đang xem xét',
  SHORTLISTED = 'Phỏng vấn',
  HIRED = 'Đã tuyển',
  REJECTED = 'Bị từ chối',
}

/**
 * Thực thể đại diện cho đơn ứng tuyển của ứng viên đối với tin tuyển dụng.
 */
@Entity('applications')
export class Application extends EntityBase {
  /**
   * Tin tuyển dụng ứng tuyển.
   */
  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  /**
   * ID tin tuyển dụng.
   */
  @Column({ name: 'job_id', type: 'integer' })
  jobId: number;

  /**
   * Hồ sơ ứng viên nộp đơn.
   */
  @ManyToOne(() => CandidateProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: CandidateProfile;

  /**
   * ID hồ sơ ứng viên.
   */
  @Column({ name: 'profile_id', type: 'integer' })
  profileId: number;

  /**
   * Thư giới thiệu của ứng viên.
   */
  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter?: string | null;

  /**
   * CV của ứng viên được đính kèm tại thời điểm nộp đơn.
   */
  @ManyToOne(() => CandidateCv, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_cv_id' })
  candidateCv: CandidateCv;

  /**
   * ID file CV ứng viên.
   */
  @Column({ name: 'candidate_cv_id', type: 'integer' })
  candidateCvId: number;

  /**
   * Trạng thái đơn ứng tuyển.
   */
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  /**
   * Ghi chú nội bộ của nhà tuyển dụng.
   */
  @Column({ name: 'employer_note', type: 'text', nullable: true })
  employerNote?: string | null;

  /**
   * Thời gian nộp đơn ứng tuyển.
   */
  @Column({
    name: 'submitted_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  submittedAt: Date;

  /**
   * Thời gian xem xét đơn ứng tuyển (chuyển trạng thái từ submitted sang trạng thái khác).
   */
  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;
}
