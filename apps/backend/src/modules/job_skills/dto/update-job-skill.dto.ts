import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobSkillDto {
  @ApiPropertyOptional({
    description: 'ID tin tuyển dụng liên kết',
    example: 1,
  })
  @IsNumber({}, { message: 'ID tin tuyển dụng phải là số' })
  @IsOptional()
  jobId?: number;

  @ApiPropertyOptional({
    description: 'Tên kỹ năng chuyên môn yêu cầu',
    example: 'React',
  })
  @IsString({ message: 'Tên kỹ năng phải là chuỗi' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Số năm kinh nghiệm tối thiểu yêu cầu',
    example: 1,
  })
  @IsNumber({}, { message: 'Kinh nghiệm tối thiểu phải là số' })
  @Min(0, { message: 'Kinh nghiệm tối thiểu không được âm' })
  @IsOptional()
  experienceStart?: number;

  @ApiPropertyOptional({
    description: 'Số năm kinh nghiệm tối đa yêu cầu',
    example: 5,
  })
  @IsNumber({}, { message: 'Kinh nghiệm tối đa phải là số' })
  @Min(0, { message: 'Kinh nghiệm tối đa không được âm' })
  @IsOptional()
  experienceEnd?: number;
}
