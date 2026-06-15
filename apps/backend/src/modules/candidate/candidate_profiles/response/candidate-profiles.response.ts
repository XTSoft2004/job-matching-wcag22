import { Expose, Type } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { UserResponse } from '@/modules/users/response/users.response';
import { CandidateExperienceResponse } from '@/modules/candidate/candidate_experiences/response/candidate-experiences.response';
import { CandidateEducationResponse } from '@/modules/candidate/candidate_educations/response/candidate-educations.response';
import { CandidateSkillResponse } from '@/modules/candidate/candidate_skills/response/candidate-skills.response';
import { CandidateCvResponse } from '@/modules/candidate/candidate_cvs/response/candidate-cvs.response';

/**
 * Response DTO for CandidateProfile — includes nested relation responses.
 */
export class CandidateProfileResponse extends BaseResponse {
  @Expose()
  userId: number;

  @Expose()
  title?: string;

  @Expose()
  summary?: string;

  @Expose()
  dateOfBirth?: Date | null;

  @Expose()
  gender?: string | null;

  @Expose()
  address?: string | null;

  @Expose()
  province?: string | null;

  @Expose()
  experienceLevel?: string | null;

  @Expose()
  expectedSalaryMin?: number | null;

  @Expose()
  expectedSalaryMax?: number | null;

  @Expose()
  isOpenToWork: boolean;

  @Expose()
  @Type(() => UserResponse)
  user?: UserResponse;

  @Expose()
  @Type(() => CandidateExperienceResponse)
  experiences?: CandidateExperienceResponse[];

  @Expose()
  @Type(() => CandidateEducationResponse)
  educations?: CandidateEducationResponse[];

  @Expose()
  @Type(() => CandidateSkillResponse)
  skills?: CandidateSkillResponse[];

  @Expose()
  @Type(() => CandidateCvResponse)
  cvs?: CandidateCvResponse[];
}

export type CandidateProfilePaginatedResponse = ResponseHttp<CandidateProfileResponse[]>;

