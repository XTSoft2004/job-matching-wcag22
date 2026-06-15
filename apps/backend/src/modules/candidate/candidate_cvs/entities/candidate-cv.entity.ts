import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { CandidateProfile } from '@/modules/candidate/candidate_profiles/entities/candidate-profile.entity';

/**
 * Thực thể CandidateCv lưu trữ thông tin về file CV đã tải lên của ứng viên.
 */
@Entity('candidate_cvs')
export class CandidateCv extends EntityBase {
  /**
   * Liên kết tới hồ sơ ứng viên sở hữu file CV này (Quan hệ N-1).
   * Khi hồ sơ ứng viên bị xóa, các file CV liên quan sẽ tự động bị xóa (CASCADE).
   */
  @ManyToOne(() => CandidateProfile, (profile) => profile.cvs, {
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
   * Đường dẫn URL file CV trên hệ thống lưu trữ (ví dụ: pdf, docx).
   */
  @Column({ name: 'cv_url', type: 'varchar', length: 500 })
  cvUrl: string;

  /**
   * Mô tả hoặc ghi chú của ứng viên về bản CV này (ví dụ: 'CV tiếng Anh', 'CV Frontend') (tùy chọn).
   */
  @Column({ type: 'text', nullable: true })
  description?: string | null;
}
