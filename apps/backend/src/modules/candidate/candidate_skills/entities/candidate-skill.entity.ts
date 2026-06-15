import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { CandidateProfile } from '@/modules/candidate/candidate_profiles/entities/candidate-profile.entity';

/**
 * Thực thể CandidateSkill lưu trữ thông tin kỹ năng chuyên môn của ứng viên.
 * Không phụ thuộc vào danh mục kỹ năng hệ thống, lưu trực tiếp tên và số năm kinh nghiệm.
 */
@Entity('candidate_skills')
@Unique(['profileId', 'name'])
export class CandidateSkill extends EntityBase {
  /**
   * Liên kết đến hồ sơ ứng viên sở hữu kỹ năng này (Quan hệ N-1).
   * Khi hồ sơ ứng viên bị xóa, các kỹ năng liên quan sẽ tự động bị xóa (CASCADE).
   */
  @ManyToOne(() => CandidateProfile, (profile) => profile.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: CandidateProfile;

  /**
   * ID hồ sơ ứng viên liên kết.
   */
  @Column({ name: 'profile_id', type: 'integer' })
  profileId: number;

  /**
   * Tên kỹ năng chuyên môn (ví dụ: 'NodeJS', 'React', 'Figma').
   */
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  /**
   * Số năm kinh nghiệm tối thiểu/bắt đầu sử dụng kỹ năng.
   */
  @Column({ name: 'experience_start', type: 'integer', nullable: true })
  experienceStart?: number;

  /**
   * Số năm kinh nghiệm tối đa/kết thúc sử dụng kỹ năng.
   */
  @Column({ name: 'experience_end', type: 'integer', nullable: true })
  experienceEnd?: number;
}
