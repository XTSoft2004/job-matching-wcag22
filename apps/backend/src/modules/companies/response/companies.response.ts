import { Expose } from 'class-transformer';
import { BaseResponse } from '@/common/response/base.response';
import { ResponseHttp } from '@/common/utils/response.util';

/**
 * Response DTO for Company.
 */
export class CompanyResponse extends BaseResponse {
  /**
   * Tên kỹ năng, công ty hoặc đối tượng.
   */
  @Expose()
  name: string;

  /**
   * Đường dẫn logo của công ty.
   */
  @Expose()
  logo?: string | null;

  /**
   * Địa chỉ website của công ty.
   */
  @Expose()
  website?: string | null;

  /**
   * Địa chỉ chi tiết.
   */
  @Expose()
  address?: string | null;

  /**
   * Mô tả chi tiết công việc hoặc nội dung.
   */
  @Expose()
  description?: string | null;

  /**
   * Quy mô nhân sự của công ty.
   */
  @Expose()
  companySize?: string | null;
}

export type CompanyPaginatedResponse = ResponseHttp<CompanyResponse[]>;

