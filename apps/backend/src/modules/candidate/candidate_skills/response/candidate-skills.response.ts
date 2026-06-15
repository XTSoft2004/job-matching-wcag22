import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for CandidateSkill.
 */
export class CandidateSkillResponse extends BaseResponse {
  @Expose()
  profileId: number;

  @Expose()
  name: string;

  @Expose()
  experienceStart?: number;

  @Expose()
  experienceEnd?: number;
}
