import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for CandidateEducation.
 */
export class CandidateEducationResponse extends BaseResponse {
  @Expose()
  profileId: number;

  @Expose()
  schoolName: string;

  @Expose()
  major?: string | null;

  @Expose()
  degree?: string | null;

  @Expose()
  startDate: Date;

  @Expose()
  endDate?: Date | null;

  @Expose()
  description?: string | null;
}
