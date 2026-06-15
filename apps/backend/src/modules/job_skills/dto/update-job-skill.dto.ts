import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobSkillDto {
  @ApiPropertyOptional({
    description: 'ID tin tuyển dụng liên kết',
    example: 1,
  })
  /**
   * ID tin tuyển dụng.
   */
  @IsNumber({}, { message: 'ID tin tuyển dụng phải là số' })
  @IsOptional()
  jobId?: number;

  @ApiPropertyOptional({
    description: 'Tên kỹ năng chuyên môn yêu cầu',
    example: 'React',
  })
  /**
   * Tên kỹ năng, công ty hoặc đối tượng.
   */
  @IsString({ message: 'Tên kỹ năng phải là chuỗi' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Số năm kinh nghiệm tối thiểu yêu cầu',
    example: 1,
  })
  /**
   * Số năm kinh nghiệm bắt đầu yêu cầu.
   */
  @IsNumber({}, { message: 'Kinh nghiệm tối thiểu phải là số' })
  @Min(0, { message: 'Kinh nghiệm tối thiểu không được âm' })
  @IsOptional()
  experienceStart?: number;

  @ApiPropertyOptional({
    description: 'Số năm kinh nghiệm tối đa yêu cầu',
    example: 5,
  })
  /**
   * Số năm kinh nghiệm kết thúc yêu cầu.
   */
  @IsNumber({}, { message: 'Kinh nghiệm tối đa phải là số' })
  @Min(0, { message: 'Kinh nghiệm tối đa không được âm' })
  @IsOptional()
  experienceEnd?: number;
}
