import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for CandidateExperience.
 */
export class CandidateExperienceResponse extends BaseResponse {
  /**
   * ID hồ sơ ứng viên.
   */
  @Expose()
  profileId: number;

  /**
   * Tên công ty hoặc tổ chức làm việc.
   */
  @Expose()
  companyName: string;

  /**
   * Vị trí công tác hoặc chức danh công việc.
   */
  @Expose()
  position: string;

  /**
   * Thời điểm bắt đầu.
   */
  @Expose()
  startDate: Date;

  /**
   * Thời điểm kết thúc.
   */
  @Expose()
  endDate?: Date | null;

  /**
   * Mô tả chi tiết công việc hoặc nội dung.
   */
  @Expose()
  description?: string | null;
}
