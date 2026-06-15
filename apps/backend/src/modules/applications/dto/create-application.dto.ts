import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({ description: 'ID tin tuyển dụng muốn ứng tuyển', example: 1 })
  @IsNumber({}, { message: 'ID tin tuyển dụng phải là số' })
  @IsNotEmpty({ message: 'ID tin tuyển dụng không được để trống' })
  jobId: number;

  @ApiProperty({ description: 'ID hồ sơ ứng viên nộp đơn', example: 1 })
  @IsNumber({}, { message: 'ID hồ sơ phải là số' })
  @IsNotEmpty({ message: 'ID hồ sơ không được để trống' })
  profileId: number;

  @ApiProperty({ description: 'ID tệp CV của ứng viên dùng để ứng tuyển', example: 1 })
  @IsNumber({}, { message: 'ID CV phải là số' })
  @IsNotEmpty({ message: 'ID CV không được để trống' })
  candidateCvId: number;

  @ApiPropertyOptional({
    description: 'Thư giới thiệu của ứng viên gửi tới nhà tuyển dụng',
    example: 'Kính chào nhà tuyển dụng, tôi muốn ứng tuyển vào vị trí này vì...',
  })
  @IsString({ message: 'Thư giới thiệu phải là chuỗi' })
  @IsOptional()
  coverLetter?: string;
}
