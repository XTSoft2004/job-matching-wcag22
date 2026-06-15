import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateSkillDto {
  @ApiProperty({ description: 'ID hồ sơ ứng viên liên kết', example: 1 })
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsNotEmpty({ message: 'ID hồ sơ không được để trống' })
  profileId: number;

  @ApiProperty({ description: 'Tên kỹ năng chuyên môn', example: 'React' })
  @IsString({ message: 'Tên kỹ năng phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên kỹ năng không được để trống' })
  name: string;

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
