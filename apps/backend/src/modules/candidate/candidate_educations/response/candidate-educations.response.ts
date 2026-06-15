import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for CandidateEducation.
 */
export class CandidateEducationResponse extends BaseResponse {
  /**
   * ID hồ sơ ứng viên.
   */
  @Expose()
  profileId: number;

  /**
   * Tên trường học hoặc cơ sở đào tạo.
   */
  @Expose()
  schoolName: string;

  /**
   * Chuyên ngành học tập.
   */
  @Expose()
  major?: string | null;

  /**
   * Bằng cấp đạt được.
   */
  @Expose()
  degree?: string | null;

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
