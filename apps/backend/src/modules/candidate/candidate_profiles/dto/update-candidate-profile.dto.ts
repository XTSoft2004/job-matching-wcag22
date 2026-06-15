import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCandidateProfileDto {
  @ApiPropertyOptional({
    description: 'Vị trí công việc mong muốn',
    example: 'React Developer',
  })
  /**
   * Tiêu đề công việc, hồ sơ hoặc tin đăng.
   */
  @IsString({ message: 'Vị trí công việc phải là chuỗi' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Giới thiệu bản thân',
    example: 'Lập trình viên đam mê công nghệ...',
  })
  /**
   * Summary.
   */
  @IsString({ message: 'Giới thiệu bản thân phải là chuỗi' })
  @IsOptional()
  summary?: string;

  /**
   * Ngày sinh
   */
  @ApiPropertyOptional({ description: 'Ngày sinh', example: '1998-05-20' })
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng YYYY-MM-DD' })
  @IsOptional()
  dateOfBirth?: string;

  /**
   * Giới tính
   */
  @ApiPropertyOptional({ description: 'Giới tính', example: 'Nam' })
  @IsString({ message: 'Giới tính phải là chuỗi' })
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ chi tiết',
    example: 'Số 12 Đường C, Quận 3',
  })
  /**
   * Địa chỉ chi tiết.
   */
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Tỉnh/Thành phố sinh sống',
    example: 'Hồ Chí Minh',
  })
  /**
   * Tỉnh/Thành phố nơi làm việc.
   */
  @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({
    description: 'Cấp bậc kinh nghiệm',
    example: 'fresher',
  })
  /**
   * Cấp bậc kinh nghiệm yêu cầu.
   */
  @IsString({ message: 'Cấp bậc kinh nghiệm phải là chuỗi' })
  @IsOptional()
  experienceLevel?: string;

  @ApiPropertyOptional({
    description: 'Mức lương kỳ vọng tối thiểu (VND)',
    example: 10000000,
  })
  /**
   * Expected Salary Min.
   */
  @IsNumber({}, { message: 'Lương tối thiểu phải là số' })
  @IsOptional()
  expectedSalaryMin?: number;

  @ApiPropertyOptional({
    description: 'Mức lương kỳ vọng tối đa (VND)',
    example: 20000000,
  })
  /**
   * Expected Salary Max.
   */
  @IsNumber({}, { message: 'Lương tối đa phải là số' })
  @IsOptional()
  expectedSalaryMax?: number;

  /**
   * Sẵn sàng nhận việc
   */
  @ApiPropertyOptional({ description: 'Sẵn sàng nhận việc', example: true })
  @IsBoolean({ message: 'isOpenToWork phải là kiểu boolean' })
  @IsOptional()
  isOpenToWork?: boolean;
}
