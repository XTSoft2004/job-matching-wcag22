import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCandidateCvDto {
  @ApiPropertyOptional({
    description: 'ID hồ sơ ứng viên liên kết',
    example: 1,
  })
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsOptional()
  profileId?: number;

  @ApiPropertyOptional({
    description: 'Đường dẫn file CV',
    example: 'https://example.com/cvs/my-cv-updated.pdf',
  })
  @IsString({ message: 'Đường dẫn CV phải là chuỗi' })
  @IsOptional()
  cvUrl?: string;

  @ApiPropertyOptional({
    description: 'Mô tả/Ghi chú cho bản CV',
    example: 'CV tiếng Anh cập nhật',
  })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Đánh dấu đây là CV chính dùng để ứng tuyển',
    example: true,
  })
  @IsBoolean({ message: 'isMain phải là kiểu boolean' })
  @IsOptional()
  isMain?: boolean;
}
