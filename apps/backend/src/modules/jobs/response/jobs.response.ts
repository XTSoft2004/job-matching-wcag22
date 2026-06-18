import { Expose, Type } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { CompanyResponse } from '@/modules/companies/response/companies.response';
import { JobSkillResponse } from '@/modules/job_skills/response/job-skills.response';
import { UserResponse } from '@/modules/users/response/users.response';
import { JobType, JobStatus } from '../entities/job.entity';

/**
 * Response DTO for Job — includes nested CompanyResponse and JobSkillResponse[].
 */
export class JobResponse extends BaseResponse {
  /**
   * ID nhà tuyển dụng đăng tin.
   */
  @Expose()
  employerId: number;

  /**
   * ID của công ty liên kết.
   */
  @Expose()
  companyId: number;

  /**
   * Tiêu đề công việc, hồ sơ hoặc tin đăng.
   */
  @Expose()
  title: string;

  /**
   * Đường dẫn thân thiện phục vụ SEO.
   */
  @Expose()
  slug: string;

  /**
   * Mô tả chi tiết công việc hoặc nội dung.
   */
  @Expose()
  description: string;

  /**
   * Yêu cầu công việc đối với ứng viên.
   */
  @Expose()
  requirements?: string;

  /**
   * Quyền lợi ứng viên được hưởng.
   */
  @Expose()
  benefits?: string;

  /**
   * Lĩnh vực hoặc ngành nghề kinh doanh.
   */
  @Expose()
  industry?: string;

  /**
   * Loại hình công việc (Toàn thời gian, Bán thời gian, v.v.).
   */
  @Expose()
  jobType: JobType;

  /**
   * Cấp bậc kinh nghiệm yêu cầu.
   */
  @Expose()
  experienceLevel?: string;

  /**
   * Số lượng cần tuyển dụng.
   */
  @Expose()
  quantity: number;

  /**
   * Mức lương tối thiểu (VND).
   */
  @Expose()
  salaryMin?: number;

  /**
   * Mức lương tối đa (VND).
   */
  @Expose()
  salaryMax?: number;

  /**
   * Lương có thể thỏa thuận hay không.
   */
  @Expose()
  isSalaryNegotiable: boolean;

  /**
   * Địa chỉ nơi làm việc cụ thể.
   */
  @Expose()
  workAddress?: string;

  /**
   * Tỉnh/Thành phố nơi làm việc.
   */
  @Expose()
  province?: string;

  /**
   * Trạng thái hoạt động hoặc trạng thái xử lý.
   */
  @Expose()
  status: JobStatus;

  /**
   * Tin tuyển dụng có được làm nổi bật không.
   */
  @Expose()
  isFeatured: boolean;

  /**
   * Tin tuyển dụng có tuyển gấp không.
   */
  @Expose()
  isUrgent: boolean;

  /**
   * Số lượt xem tin tuyển dụng.
   */
  @Expose()
  viewCount: number;

  /**
   * Số lượng hồ sơ đã ứng tuyển.
   */
  @Expose()
  applicationCount: number;

  /**
   * Thời điểm bắt đầu hiển thị tin.
   */
  @Expose()
  postingStartAt: Date;

  /**
   * Thời điểm kết thúc hiển thị tin.
   */
  @Expose()
  postingEndAt?: Date;

  /**
   * Hạn chót nộp hồ sơ ứng tuyển.
   */
  @Expose()
  deadline?: Date;

  /**
   * Thời điểm xuất bản tin tuyển dụng.
   */
  @Expose()
  publishedAt?: Date;

  /**
   * Thông tin công ty liên kết.
   */
  @Expose()
  @Type(() => CompanyResponse)
  company?: CompanyResponse;

  /**
   * Thông tin nhà tuyển dụng liên kết.
   */
  @Expose()
  @Type(() => UserResponse)
  employer?: UserResponse;

  /**
   * Danh sách kỹ năng chuyên môn.
   */
  @Expose()
  @Type(() => JobSkillResponse)
  skills?: JobSkillResponse[];
}

export type JobPaginatedResponse = ResponseHttp<JobResponse[]>;

