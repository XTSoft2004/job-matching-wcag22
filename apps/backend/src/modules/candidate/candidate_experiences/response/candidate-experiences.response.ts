import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for CandidateExperience.
 */
export class CandidateExperienceResponse extends BaseResponse {
  @Expose()
  profileId: number;

  @Expose()
  companyName: string;

  @Expose()
  position: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate?: Date | null;

  @Expose()
  description?: string | null;
}
