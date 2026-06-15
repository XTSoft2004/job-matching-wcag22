import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateCvDto {
  @ApiProperty({ description: 'ID hồ sơ ứng viên liên kết', example: 1 })
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsNotEmpty({ message: 'ID hồ sơ không được để trống' })
  profileId: number;

  @ApiProperty({
    description: 'Đường dẫn file CV',
    example: 'https://example.com/cvs/my-cv.pdf',
  })
  @IsString({ message: 'Đường dẫn CV phải là chuỗi' })
  @IsNotEmpty({ message: 'Đường dẫn CV không được để trống' })
  cvUrl: string;

  @ApiPropertyOptional({
    description: 'Mô tả/Ghi chú cho bản CV',
    example: 'CV tiếng Anh cho vị trí NodeJS',
  })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;
}
