import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';

export class BasePaginateQuery implements Partial<PaginateQuery> {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  path!: string;

  @ApiPropertyOptional({
    description: 'Trang hiện tại (bắt đầu từ 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Số lượng phần tử trên một trang',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm', example: 'admin' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Danh sách ID (cách nhau bằng dấu phẩy)', example: '1,2,3' })
  @IsOptional()
  @IsString()
  ids?: string;
}
