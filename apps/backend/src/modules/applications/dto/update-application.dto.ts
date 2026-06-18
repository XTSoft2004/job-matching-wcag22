import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/application.entity';

export class UpdateApplicationDto {
  @ApiPropertyOptional({
    description: 'ID hồ sơ ứng viên nộp đơn',
    example: 1,
  })
  /**
   * ID hồ sơ ứng viên.
   */
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsOptional()
  profileId?: number;

  @ApiPropertyOptional({
    description: 'ID tệp CV ứng tuyển',
    example: 1,
  })
  /**
   * ID tệp CV ứng viên.
   */
  @IsNumber({}, { message: 'ID CV phải là số' })
  @IsOptional()
  candidateCvId?: number;

  @ApiPropertyOptional({
    description: 'Thư giới thiệu của ứng viên gửi tới nhà tuyển dụng',
    example: 'Kính chào nhà tuyển dụng...',
  })
  /**
   * Thư giới thiệu của ứng viên gửi tới nhà tuyển dụng.
   */
  @IsString({ message: 'Thư giới thiệu phải là chuỗi' })
  @IsOptional()
  coverLetter?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái của đơn ứng tuyển',
    example: 'reviewing',
  })
  /**
   * Trạng thái hoạt động hoặc trạng thái xử lý.
   */
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Thời gian phỏng vấn',
    example: '2026-06-25T14:30:00.000Z',
  })
  /**
   * Thời gian phỏng vấn.
   */
  @IsString({ message: 'Thời gian phỏng vấn phải là chuỗi ISO' })
  @IsOptional()
  interviewTime?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú nội bộ của nhà tuyển dụng',
    example: 'Ứng viên có kỹ năng tốt, hẹn lịch phỏng vấn.',
  })
  /**
   * Ghi chú nội bộ của nhà tuyển dụng.
   */
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @IsOptional()
  employerNote?: string;
}
