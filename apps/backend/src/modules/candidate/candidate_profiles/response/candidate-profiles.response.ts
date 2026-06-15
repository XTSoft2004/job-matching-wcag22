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
  /**
   * ID tài khoản người dùng.
   */
  @Expose()
  userId: number;

  /**
   * Tiêu đề công việc, hồ sơ hoặc tin đăng.
   */
  @Expose()
  title?: string;

  /**
   * Summary.
   */
  @Expose()
  summary?: string;

  /**
   * Date Of Birth.
   */
  @Expose()
  dateOfBirth?: Date | null;

  /**
   * Gender.
   */
  @Expose()
  gender?: string | null;

  /**
   * Địa chỉ chi tiết.
   */
  @Expose()
  address?: string | null;

  /**
   * Tỉnh/Thành phố nơi làm việc.
   */
  @Expose()
  province?: string | null;

  /**
   * Cấp bậc kinh nghiệm yêu cầu.
   */
  @Expose()
  experienceLevel?: string | null;

  /**
   * Expected Salary Min.
   */
  @Expose()
  expectedSalaryMin?: number | null;

  /**
   * Expected Salary Max.
   */
  @Expose()
  expectedSalaryMax?: number | null;

  /**
   * Is Open To Work.
   */
  @Expose()
  isOpenToWork: boolean;

  /**
   * Thông tin tài khoản người dùng.
   */
  @Expose()
  @Type(() => UserResponse)
  user?: UserResponse;

  /**
   * Danh sách kinh nghiệm làm việc.
   */
  @Expose()
  @Type(() => CandidateExperienceResponse)
  experiences?: CandidateExperienceResponse[];

  /**
   * Danh sách lịch sử học vấn.
   */
  @Expose()
  @Type(() => CandidateEducationResponse)
  educations?: CandidateEducationResponse[];

  /**
   * Danh sách kỹ năng chuyên môn.
   */
  @Expose()
  @Type(() => CandidateSkillResponse)
  skills?: CandidateSkillResponse[];

  /**
   * Danh sách các CV đã tải lên.
   */
  @Expose()
  @Type(() => CandidateCvResponse)
  cvs?: CandidateCvResponse[];
}

export type CandidateProfilePaginatedResponse = ResponseHttp<CandidateProfileResponse[]>;

