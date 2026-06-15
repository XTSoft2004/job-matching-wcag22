import { Expose, Type } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { CompanyResponse } from '@/modules/companies/response/companies.response';
import { JobSkillResponse } from '@/modules/job_skills/response/job-skills.response';
import { JobType, JobStatus } from '../entities/job.entity';

/**
 * Response DTO for Job — includes nested CompanyResponse and JobSkillResponse[].
 */
export class JobResponse extends BaseResponse {
  @Expose()
  employerId: number;

  @Expose()
  companyId: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  requirements?: string;

  @Expose()
  benefits?: string;

  @Expose()
  industry?: string;

  @Expose()
  jobType: JobType;

  @Expose()
  experienceLevel?: string;

  @Expose()
  quantity: number;

  @Expose()
  salaryMin?: number;

  @Expose()
  salaryMax?: number;

  @Expose()
  isSalaryNegotiable: boolean;

  @Expose()
  workAddress?: string;

  @Expose()
  province?: string;

  @Expose()
  status: JobStatus;

  @Expose()
  isFeatured: boolean;

  @Expose()
  isUrgent: boolean;

  @Expose()
  viewCount: number;

  @Expose()
  applicationCount: number;

  @Expose()
  postingStartAt: Date;

  @Expose()
  postingEndAt?: Date;

  @Expose()
  deadline?: Date;

  @Expose()
  publishedAt?: Date;

  @Expose()
  @Type(() => CompanyResponse)
  company?: CompanyResponse;

  @Expose()
  @Type(() => JobSkillResponse)
  skills?: JobSkillResponse[];
}

export type JobPaginatedResponse = ResponseHttp<JobResponse[]>;

