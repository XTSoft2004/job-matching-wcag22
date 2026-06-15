import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCandidateSkillDto {
  @ApiPropertyOptional({
    description: 'ID hồ sơ ứng viên liên kết',
    example: 1,
  })
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsOptional()
  profileId?: number;

  @ApiPropertyOptional({
    description: 'Tên kỹ năng chuyên môn',
    example: 'React',
  })
  @IsString({ message: 'Tên kỹ năng phải là chuỗi' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Số năm kinh nghiệm bắt đầu/tối thiểu',
    example: 1,
  })
  @IsNumber({}, { message: 'Kinh nghiệm bắt đầu phải là số' })
  @Min(0, { message: 'Kinh nghiệm bắt đầu không được âm' })
  @IsOptional()
  experienceStart?: number;

  @ApiPropertyOptional({
    description: 'Số năm kinh nghiệm kết thúc/tối đa',
    example: 5,
  })
  @IsNumber({}, { message: 'Kinh nghiệm kết thúc phải là số' })
  @Min(0, { message: 'Kinh nghiệm kết thúc không được âm' })
  @IsOptional()
  experienceEnd?: number;
}
