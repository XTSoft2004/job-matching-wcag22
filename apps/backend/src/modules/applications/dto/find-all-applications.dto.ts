import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import { ApplicationStatus } from '../entities/application.entity';

export class FindAllApplicationsDto extends BasePaginateQuery {
  @ApiPropertyOptional({ description: 'Lọc theo ID tin tuyển dụng', example: 1 })
  @IsNumber({}, { message: 'jobId phải là số' })
  @IsOptional()
  @Type(() => Number)
  jobId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo ID hồ sơ ứng viên', example: 1 })
  @IsNumber({}, { message: 'profileId phải là số' })
  @IsOptional()
  @Type(() => Number)
  profileId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái đơn ứng tuyển', enum: ApplicationStatus })
  @IsEnum(ApplicationStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: ApplicationStatus;
}
