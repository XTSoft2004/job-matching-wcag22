import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, JobStatus } from '../entities/job.entity';

export class UpdateJobDto {
  @ApiPropertyOptional({
    description: 'ID người đăng tin (Nhà tuyển dụng)',
    example: 1,
  })
  @IsNumber({}, { message: 'ID nhà tuyển dụng phải là số' })
  @IsOptional()
  employerId?: number;

  @ApiPropertyOptional({ description: 'ID công ty tuyển dụng', example: 1 })
  @IsNumber({}, { message: 'ID công ty phải là số' })
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({
    description: 'Tiêu đề tin tuyển dụng',
    example: 'React Developer',
  })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Mô tả công việc',
    example: 'Lập trình ứng dụng Web bằng React...',
  })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Yêu cầu công việc',
    example: 'Có 2 năm kinh nghiệm...',
  })
  @IsString({ message: 'Yêu cầu phải là chuỗi' })
  @IsOptional()
  requirements?: string;

  @ApiPropertyOptional({
    description: 'Quyền lợi được hưởng',
    example: 'Mức lương cạnh tranh...',
  })
  @IsString({ message: 'Quyền lợi phải là chuỗi' })
  @IsOptional()
  benefits?: string;

  @ApiPropertyOptional({
    description: 'Lĩnh vực/Ngành nghề',
    example: 'Công nghệ thông tin',
  })
  @IsString({ message: 'Ngành nghề phải là chuỗi' })
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Loại hình công việc',
    enum: JobType,
    example: JobType.FULL_TIME,
  })
  @IsEnum(JobType, { message: 'Loại hình công việc không hợp lệ' })
  @IsOptional()
  jobType?: JobType;

  @ApiPropertyOptional({
    description: 'Yêu cầu cấp bậc/kinh nghiệm',
    example: 'Junior',
  })
  @IsString({ message: 'Cấp bậc kinh nghiệm phải là chuỗi' })
  @IsOptional()
  experienceLevel?: string;

  @ApiPropertyOptional({ description: 'Số lượng tuyển dụng', example: 1 })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng tuyển tối thiểu là 1' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Lương tối thiểu (VND)',
    example: 10000000,
  })
  @IsNumber({}, { message: 'Lương tối thiểu phải là số' })
  @Min(0, { message: 'Lương tối thiểu không được âm' })
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Lương tối đa (VND)', example: 20000000 })
  @IsNumber({}, { message: 'Lương tối đa phải là số' })
  @Min(0, { message: 'Lương tối đa không được âm' })
  @IsOptional()
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'Lương thỏa thuận', example: false })
  @IsOptional()
  isSalaryNegotiable?: boolean;

  @ApiPropertyOptional({
    description: 'Địa chỉ làm việc',
    example: '123 Nguyễn Huệ, Quận 1, TPHCM',
  })
  @IsString({ message: 'Địa chỉ làm việc phải là chuỗi' })
  @IsOptional()
  workAddress?: string;

  @ApiPropertyOptional({
    description: 'Tỉnh/Thành phố làm việc',
    example: 'Hồ Chí Minh',
  })
  @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái tin tuyển dụng',
    enum: JobStatus,
    example: JobStatus.ACTIVE,
  })
  @IsEnum(JobStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: JobStatus;
}
