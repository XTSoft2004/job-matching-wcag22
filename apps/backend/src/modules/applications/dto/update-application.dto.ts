import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/application.entity';

export class UpdateApplicationDto {
  @ApiPropertyOptional({
    description: 'ID hồ sơ ứng viên nộp đơn',
    example: 1,
  })
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsOptional()
  profileId?: number;

  @ApiPropertyOptional({
    description: 'ID tệp CV ứng tuyển',
    example: 1,
  })
  @IsNumber({}, { message: 'ID CV phải là số' })
  @IsOptional()
  candidateCvId?: number;

  @ApiPropertyOptional({
    description: 'Thư giới thiệu của ứng viên gửi tới nhà tuyển dụng',
    example: 'Kính chào nhà tuyển dụng...',
  })
  @IsString({ message: 'Thư giới thiệu phải là chuỗi' })
  @IsOptional()
  coverLetter?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái của đơn ứng tuyển',
    enum: ApplicationStatus,
    example: ApplicationStatus.REVIEWING,
  })
  @IsEnum(ApplicationStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Ghi chú nội bộ của nhà tuyển dụng',
    example: 'Ứng viên có kỹ năng tốt, hẹn lịch phỏng vấn.',
  })
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @IsOptional()
  employerNote?: string;
}
