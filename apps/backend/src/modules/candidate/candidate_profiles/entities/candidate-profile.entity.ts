import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { EntityBase } from '@/common/entity/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CandidateExperience } from '@/modules/candidate/candidate_experiences/entities/candidate-experience.entity';
import { CandidateEducation } from '@/modules/candidate/candidate_educations/entities/candidate-education.entity';
import { CandidateSkill } from '@/modules/candidate/candidate_skills/entities/candidate-skill.entity';
import { CandidateCv } from '@/modules/candidate/candidate_cvs/entities/candidate-cv.entity';

/**
 * Thực thể CandidateProfile đại diện cho hồ sơ xin việc chi tiết của ứng viên.
 * Liên kết 1-1 với tài khoản User và chứa danh sách các thông tin liên quan (kinh nghiệm, học vấn, kỹ năng, CVs).
 */
@Entity('candidate_profiles')
export class CandidateProfile extends EntityBase {
  /**
   * Liên kết đến tài khoản User sở hữu hồ sơ này (Quan hệ 1-1).
   * Khi tài khoản bị xóa, hồ sơ ứng viên sẽ bị xóa theo (CASCADE).
   */
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * ID người dùng liên kết.
   */
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  /**
   * Tiêu đề hồ sơ / Vị trí mong muốn ứng tuyển (ví dụ: 'Frontend Developer').
   */
  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  /**
   * Tóm tắt ngắn gọn giới thiệu về bản thân ứng viên.
   */
  @Column({ type: 'text', nullable: true })
  summary?: string;

  /**
   * Ngày sinh của ứng viên.
   */
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date | null;

  /**
   * Giới tính của ứng viên.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  gender?: string | null;

  /**
   * Địa chỉ liên hệ chi tiết của ứng viên.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string | null;

  /**
   * Tỉnh/Thành phố sinh sống (phục vụ lọc tìm kiếm khu vực).
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  province?: string | null;

  /**
   * Cấp bậc kinh nghiệm hiện tại (ví dụ: 'Fresher', 'Junior', 'Senior').
   */
  @Column({
    name: 'experience_level',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  experienceLevel?: string | null;

  /**
   * Mức lương kỳ vọng tối thiểu (VND).
   */
  @Column({
    name: 'expected_salary_min',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  expectedSalaryMin?: number | null;

  /**
   * Mức lương kỳ vọng tối đa (VND).
   */
  @Column({
    name: 'expected_salary_max',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  expectedSalaryMax?: number | null;

  /**
   * Trạng thái sẵn sàng tìm việc (true là mở tìm việc, false là đóng).
   */
  @Column({ name: 'is_open_to_work', type: 'boolean', default: true })
  isOpenToWork: boolean;

  /**
   * Danh sách CV ứng viên đã tải lên hệ thống.
   */
  @OneToMany(() => CandidateCv, (cv) => cv.profile)
  cvs: CandidateCv[];

  /**
   * Danh sách kinh nghiệm làm việc chi tiết của ứng viên.
   */
  @OneToMany(() => CandidateExperience, (experience) => experience.profile)
  experiences: CandidateExperience[];

  /**
   * Danh sách lịch sử học tập/đào tạo của ứng viên.
   */
  @OneToMany(() => CandidateEducation, (education) => education.profile)
  educations: CandidateEducation[];

  /**
   * Danh sách kỹ năng chuyên môn của ứng viên.
   */
  @OneToMany(() => CandidateSkill, (skill) => skill.profile)
  skills: CandidateSkill[];
}
