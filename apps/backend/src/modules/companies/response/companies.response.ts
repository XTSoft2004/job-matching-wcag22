import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';
import { ResponseHttp } from '@/common/utils/response.util';

/**
 * Response DTO for Company.
 */
export class CompanyResponse extends BaseResponse {
  @Expose()
  name: string;

  @Expose()
  logo?: string | null;

  @Expose()
  website?: string | null;

  @Expose()
  address?: string | null;

  @Expose()
  description?: string | null;

  @Expose()
  companySize?: string | null;
}

export type CompanyPaginatedResponse = ResponseHttp<CompanyResponse[]>;

