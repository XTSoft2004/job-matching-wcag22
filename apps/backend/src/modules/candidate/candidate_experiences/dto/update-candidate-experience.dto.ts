import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCandidateExperienceDto {
  @ApiPropertyOptional({
    description: 'ID hồ sơ ứng viên liên kết',
    example: 1,
  })
  /**
   * ID hồ sơ ứng viên.
   */
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsOptional()
  profileId?: number;

  @ApiPropertyOptional({
    description: 'Tên công ty ứng viên từng làm việc',
    example: 'Công ty Công nghệ XYZ',
  })
  /**
   * Tên công ty hoặc tổ chức làm việc.
   */
  @IsString({ message: 'Tên công ty phải là chuỗi' })
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Vị trí đảm nhiệm',
    example: 'NodeJS Developer',
  })
  /**
   * Vị trí công tác hoặc chức danh công việc.
   */
  @IsString({ message: 'Vị trí làm việc phải là chuỗi' })
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu làm việc',
    example: '2023-01-01',
  })
  /**
   * Thời điểm bắt đầu.
   */
  @IsDateString({}, { message: 'Ngày bắt đầu không đúng định dạng YYYY-MM-DD' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc làm việc (nếu có)',
    example: '2024-05-01',
  })
  @IsDateString(
    {},
    { message: 'Ngày kết thúc không đúng định dạng YYYY-MM-DD' },
  )
  /**
   * Thời điểm kết thúc.
   */
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết công việc',
    example: 'Xây dựng REST APIs, tối ưu DB...',
  })
  /**
   * Mô tả chi tiết công việc hoặc nội dung.
   */
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;
}
