import { Expose, Type } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { JobResponse } from '@/modules/jobs/response/jobs.response';
import { CandidateCvResponse } from '@/modules/candidate/candidate_cvs/response/candidate-cvs.response';
import { CandidateProfileResponse } from '@/modules/candidate/candidate_profiles/response/candidate-profiles.response';
import { ApplicationStatus } from '../entities/application.entity';

/**
 * Response DTO cho Đơn ứng tuyển. Expose các thuộc tính cần thiết bao gồm cả quan hệ lồng nhau.
 */
export class ApplicationResponse extends BaseResponse {
  @Expose()
  jobId: number;

  @Expose()
  profileId: number;

  @Expose()
  coverLetter?: string | null;

  @Expose()
  candidateCvId: number;

  @Expose()
  status: ApplicationStatus;

  @Expose()
  employerNote?: string | null;

  @Expose()
  submittedAt: Date;

  @Expose()
  reviewedAt?: Date | null;

  @Expose()
  @Type(() => JobResponse)
  job?: JobResponse;

  @Expose()
  @Type(() => CandidateProfileResponse)
  profile?: CandidateProfileResponse;

  @Expose()
  @Type(() => CandidateCvResponse)
  candidateCv?: CandidateCvResponse;
}

export type ApplicationPaginatedResponse = ResponseHttp<ApplicationResponse[]>;
