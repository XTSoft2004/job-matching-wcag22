import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for CandidateCv.
 */
export class CandidateCvResponse extends BaseResponse {
  /**
   * ID hồ sơ ứng viên.
   */
  @Expose()
  profileId: number;

  /**
   * Đường dẫn URL tải tệp CV.
   */
  @Expose()
  cvUrl: string;

  /**
   * Mô tả chi tiết công việc hoặc nội dung.
   */
  @Expose()
  description?: string | null;
}
