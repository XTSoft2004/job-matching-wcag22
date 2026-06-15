import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobSkillDto {
  /**
   * ID tin tuyển dụng liên kết
   */
  @ApiProperty({ description: 'ID tin tuyển dụng liên kết', example: 1 })
  @IsNumber({}, { message: 'ID tin tuyển dụng phải là số' })
  @IsNotEmpty({ message: 'ID tin tuyển dụng không được để trống' })
  jobId: number;

  @ApiProperty({
    description: 'Tên kỹ năng chuyên môn yêu cầu',
    example: 'React',
  })
  /**
   * Tên kỹ năng, công ty hoặc đối tượng.
   */
  @IsString({ message: 'Tên kỹ năng phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên kỹ năng không được để trống' })
  name: string;

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
