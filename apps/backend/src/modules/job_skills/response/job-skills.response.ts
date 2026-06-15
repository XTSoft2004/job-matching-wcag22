import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';

/**
 * Response DTO for JobSkill.
 */
export class JobSkillResponse extends BaseResponse {
  @Expose()
  jobId: number;

  @Expose()
  name: string;

  @Expose()
  experienceStart?: number;

  @Expose()
  experienceEnd?: number;
}
