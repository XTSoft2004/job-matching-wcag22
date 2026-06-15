import { ApiProperty } from '@nestjs/swagger';
import { HttpStatusCode } from './http-status-code';

export type PaginationMetaInput = {
  itemsPerPage: number;
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
};

export class MetaResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export class ResponseHttp<T> {
  @ApiProperty({ example: 200, description: 'Mã trạng thái HTTP' })
  statusCode: HttpStatusCode;

  @ApiProperty({ example: 'Thông báo', description: 'Thông điệp phản hồi' })
  message: string | string[];

  @ApiProperty({
    description: 'Dữ liệu phản hồi',
    required: false,
    example: {},
  })
  data?: T;

  @ApiProperty({
    description: 'Thông tin phân trang',
    required: false,
    type: Object,
  })
  meta?: MetaResponse;

  constructor(
    message: string | string[],
    data?: T,
    statusCode: HttpStatusCode = HttpStatusCode.OK,
    meta?: PaginationMetaInput,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (meta) {
      this.meta = {
        limit: meta.itemsPerPage,
        page: meta.currentPage ?? 1,
        total: meta.totalItems ?? 0,
        totalPages: meta.totalPages ?? 0,
        totalItems: meta.totalItems ?? 0,
      };
    }
  }

  static success<T>({
    message,
    data,
    meta,
    statusCode = HttpStatusCode.OK,
  }: {
    message: string;
    data?: T;
    meta?: PaginationMetaInput;
    statusCode?: HttpStatusCode;
  }) {
    return new ResponseHttp<T>(message, data, statusCode, meta);
  }

  static error<T>({
    message,
    statusCode = HttpStatusCode.BAD_REQUEST,
    data,
  }: {
    message: string | string[];
    statusCode?: HttpStatusCode;
    data?: T;
  }) {
    return new ResponseHttp<T>(message, data, statusCode);
  }
}
