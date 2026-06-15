import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateExperienceDto {
  @ApiProperty({ description: 'ID hồ sơ ứng viên liên kết', example: 1 })
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsNotEmpty({ message: 'ID hồ sơ không được để trống' })
  profileId: number;

  @ApiProperty({
    description: 'Tên công ty ứng viên từng làm việc',
    example: 'Công ty Công nghệ XYZ',
  })
  @IsString({ message: 'Tên công ty phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  companyName: string;

  @ApiProperty({ description: 'Vị trí đảm nhiệm', example: 'NodeJS Developer' })
  @IsString({ message: 'Vị trí làm việc phải là chuỗi' })
  @IsNotEmpty({ message: 'Vị trí làm việc không được để trống' })
  position: string;

  @ApiProperty({ description: 'Ngày bắt đầu làm việc', example: '2023-01-01' })
  @IsDateString({}, { message: 'Ngày bắt đầu không đúng định dạng YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: string;

  @ApiPropertyOptional({
    description:
      'Ngày kết thúc làm việc (nếu có, nếu trống nghĩa là đang làm việc tại đây)',
    example: '2024-05-01',
  })
  @IsDateString(
    {},
    { message: 'Ngày kết thúc không đúng định dạng YYYY-MM-DD' },
  )
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết công việc',
    example: 'Xây dựng REST APIs, tối ưu DB...',
  })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;
}
