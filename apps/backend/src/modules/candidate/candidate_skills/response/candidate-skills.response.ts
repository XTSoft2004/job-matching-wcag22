import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for CandidateSkill.
 */
export class CandidateSkillResponse extends BaseResponse {
  /**
   * ID hồ sơ ứng viên.
   */
  @Expose()
  profileId: number;

  /**
   * Tên kỹ năng, công ty hoặc đối tượng.
   */
  @Expose()
  name: string;

  /**
   * Số năm kinh nghiệm bắt đầu yêu cầu.
   */
  @Expose()
  experienceStart?: number;

  /**
   * Số năm kinh nghiệm kết thúc yêu cầu.
   */
  @Expose()
  experienceEnd?: number;
}
