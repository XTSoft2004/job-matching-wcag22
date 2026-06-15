import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for JobSkill.
 */
export class JobSkillResponse extends BaseResponse {
  /**
   * ID tin tuyển dụng.
   */
  @Expose()
  jobId: number;

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
