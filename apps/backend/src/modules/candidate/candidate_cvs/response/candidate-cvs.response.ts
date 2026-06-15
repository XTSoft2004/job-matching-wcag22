import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for CandidateCv.
 */
export class CandidateCvResponse extends BaseResponse {
  @Expose()
  profileId: number;

  @Expose()
  cvUrl: string;

  @Expose()
  description?: string | null;
}
