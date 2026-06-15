import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateProfileDto {
  @ApiProperty({ description: 'ID người dùng liên kết (ứng viên)', example: 1 })
  @IsNumber({}, { message: 'ID người dùng phải là số' })
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  userId: number;

  @ApiPropertyOptional({
    description: 'Vị trí công việc mong muốn',
    example: 'React Developer',
  })
  @IsString({ message: 'Vị trí công việc phải là chuỗi' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Giới thiệu bản thân',
    example: 'Lập trình viên đam mê công nghệ...',
  })
  @IsString({ message: 'Giới thiệu bản thân phải là chuỗi' })
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh', example: '1998-05-20' })
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng YYYY-MM-DD' })
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Giới tính', example: 'Nam' })
  @IsString({ message: 'Giới tính phải là chuỗi' })
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ chi tiết',
    example: 'Số 12 Đường C, Quận 3',
  })
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Tỉnh/Thành phố sinh sống',
    example: 'Hồ Chí Minh',
  })
  @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({
    description: 'Cấp bậc kinh nghiệm',
    example: 'fresher',
  })
  @IsString({ message: 'Cấp bậc kinh nghiệm phải là chuỗi' })
  @IsOptional()
  experienceLevel?: string;

  @ApiPropertyOptional({
    description: 'Mức lương kỳ vọng tối thiểu (VND)',
    example: 10000000,
  })
  @IsNumber({}, { message: 'Lương tối thiểu phải là số' })
  @IsOptional()
  expectedSalaryMin?: number;

  @ApiPropertyOptional({
    description: 'Mức lương kỳ vọng tối đa (VND)',
    example: 20000000,
  })
  @IsNumber({}, { message: 'Lương tối đa phải là số' })
  @IsOptional()
  expectedSalaryMax?: number;

  @ApiPropertyOptional({ description: 'Sẵn sàng nhận việc', example: true })
  @IsBoolean({ message: 'isOpenToWork phải là kiểu boolean' })
  @IsOptional()
  isOpenToWork?: boolean;
}
