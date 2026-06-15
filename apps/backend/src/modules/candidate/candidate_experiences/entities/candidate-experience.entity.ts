import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { CandidateProfile } from '@/modules/candidate/candidate_profiles/entities/candidate-profile.entity';

/**
 * Thực thể CandidateExperience lưu trữ lịch sử kinh nghiệm làm việc của ứng viên.
 */
@Entity('candidate_experiences')
export class CandidateExperience extends EntityBase {
  /**
   * Liên kết đến hồ sơ ứng viên sở hữu mốc kinh nghiệm này (Quan hệ N-1).
   * Khi hồ sơ ứng viên bị xóa, các kinh nghiệm liên quan sẽ tự động bị xóa (CASCADE).
   */
  @ManyToOne(() => CandidateProfile, (profile) => profile.experiences, {
    onDelete: 'CASCADE',
  })
  /**
   * Thông tin chi tiết hồ sơ ứng viên.
   */
  @JoinColumn({ name: 'profile_id' })
  profile: CandidateProfile;

  /**
   * ID hồ sơ ứng viên liên kết.
   */
  @Column({ name: 'profile_id', type: 'integer' })
  profileId: number;

  /**
   * Tên công ty/doanh nghiệp ứng viên từng làm việc.
   */
  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName: string;

  /**
   * Vị trí đảm nhiệm (ví dụ: 'NodeJS Developer').
   */
  @Column({ type: 'varchar', length: 255 })
  position: string;

  /**
   * Ngày bắt đầu làm việc.
   */
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  /**
   * Ngày kết thúc làm việc (nếu có, để trống nghĩa là đang làm việc tại đây).
   */
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date | null;

  /**
   * Mô tả chi tiết về công việc, trách nhiệm và thành tích đạt được.
   */
  @Column({ type: 'text', nullable: true })
  description?: string | null;
}
