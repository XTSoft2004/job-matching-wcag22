import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { CandidateProfile } from '@/modules/candidate/candidate_profiles/entities/candidate-profile.entity';

/**
 * Thực thể CandidateEducation lưu trữ lịch sử học vấn, bằng cấp và quá trình đào tạo của ứng viên.
 */
@Entity('candidate_educations')
export class CandidateEducation extends EntityBase {
  /**
   * Liên kết đến hồ sơ ứng viên sở hữu lịch sử học vấn này (Quan hệ N-1).
   * Khi hồ sơ ứng viên bị xóa, thông tin học vấn liên quan sẽ tự động bị xóa (CASCADE).
   */
  @ManyToOne(() => CandidateProfile, (profile) => profile.educations, {
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
   * Tên trường học, trung tâm đào tạo ứng viên theo học.
   */
  @Column({ name: 'school_name', type: 'varchar', length: 255 })
  schoolName: string;

  /**
   * Chuyên ngành học (ví dụ: 'Khoa học máy tính') (tùy chọn).
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  major?: string | null;

  /**
   * Bằng cấp, chứng chỉ đạt được (ví dụ: 'Cử nhân', 'Thạc sĩ') (tùy chọn).
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  degree?: string | null;

  /**
   * Ngày bắt đầu quá trình học tập.
   */
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  /**
   * Ngày tốt nghiệp / Kết thúc khóa học (nếu có, để trống nghĩa là đang học tại đây).
   */
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date | null;

  /**
   * Mô tả chi tiết quá trình học tập hoặc các hoạt động nổi bật (tùy chọn).
   */
  @Column({ type: 'text', nullable: true })
  description?: string | null;
}
