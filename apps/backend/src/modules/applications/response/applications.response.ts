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
  /**
   * ID tin tuyển dụng.
   */
  @Expose()
  jobId: number;

  /**
   * ID hồ sơ ứng viên.
   */
  @Expose()
  profileId: number;

  /**
   * Thư giới thiệu của ứng viên gửi tới nhà tuyển dụng.
   */
  @Expose()
  coverLetter?: string | null;

  /**
   * ID tệp CV ứng viên.
   */
  @Expose()
  candidateCvId: number;

  /**
   * Trạng thái hoạt động hoặc trạng thái xử lý.
   */
  @Expose()
  status: ApplicationStatus;

  /**
   * Thời gian phỏng vấn.
   */
  @Expose()
  interviewTime?: Date | null;

  /**
   * Ghi chú nội bộ của nhà tuyển dụng.
   */
  @Expose()
  employerNote?: string | null;

  /**
   * Thời gian nộp đơn ứng tuyển.
   */
  @Expose()
  submittedAt: Date;

  /**
   * Thời gian xem xét đơn ứng tuyển.
   */
  @Expose()
  reviewedAt?: Date | null;

  /**
   * Thông tin chi tiết tin tuyển dụng.
   */
  @Expose()
  @Type(() => JobResponse)
  job?: JobResponse;

  /**
   * Thông tin chi tiết hồ sơ ứng viên.
   */
  @Expose()
  @Type(() => CandidateProfileResponse)
  profile?: CandidateProfileResponse;

  /**
   * Thông tin tệp CV ứng viên.
   */
  @Expose()
  @Type(() => CandidateCvResponse)
  candidateCv?: CandidateCvResponse;
}

export type ApplicationPaginatedResponse = ResponseHttp<ApplicationResponse[]>;
