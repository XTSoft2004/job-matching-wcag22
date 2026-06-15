import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateEducationDto {
  /**
   * ID hồ sơ ứng viên liên kết
   */
  @ApiProperty({ description: 'ID hồ sơ ứng viên liên kết', example: 1 })
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsNotEmpty({ message: 'ID hồ sơ không được để trống' })
  profileId: number;

  @ApiProperty({
    description: 'Tên trường học/trung tâm đào tạo',
    example: 'Đại học Bách Khoa',
  })
  /**
   * Tên trường học hoặc cơ sở đào tạo.
   */
  @IsString({ message: 'Tên trường học phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên trường học không được để trống' })
  schoolName: string;

  @ApiPropertyOptional({
    description: 'Chuyên ngành học',
    example: 'Khoa học Máy tính',
  })
  /**
   * Chuyên ngành học tập.
   */
  @IsString({ message: 'Chuyên ngành phải là chuỗi' })
  @IsOptional()
  major?: string;

  @ApiPropertyOptional({
    description: 'Bằng cấp/Chứng chỉ nhận được',
    example: 'Kỹ sư',
  })
  /**
   * Bằng cấp đạt được.
   */
  @IsString({ message: 'Bằng cấp phải là chuỗi' })
  @IsOptional()
  degree?: string;

  /**
   * Ngày bắt đầu học
   */
  @ApiProperty({ description: 'Ngày bắt đầu học', example: '2019-09-05' })
  @IsDateString({}, { message: 'Ngày bắt đầu không đúng định dạng YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: string;

  @ApiPropertyOptional({
    description: 'Ngày tốt nghiệp/kết thúc học',
    example: '2023-06-30',
  })
  @IsDateString(
    {},
    { message: 'Ngày tốt nghiệp không đúng định dạng YYYY-MM-DD' },
  )
  /**
   * Thời điểm kết thúc.
   */
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết quá trình học tập',
    example: 'Đạt học bổng xuất sắc...',
  })
  /**
   * Mô tả chi tiết công việc hoặc nội dung.
   */
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;
}
