import { IsString, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Tên công ty/doanh nghiệp',
    example: 'Công ty Công nghệ ABC Cập nhật',
  })
  /**
   * Tên kỹ năng, công ty hoặc đối tượng.
   */
  @IsString({ message: 'Tên công ty phải là chuỗi' })
  @IsOptional()
  @Length(1, 255, { message: 'Tên công ty từ 1 đến 255 ký tự' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh logo công ty',
    example: 'https://example.com/logo-new.png',
  })
  /**
   * Đường dẫn logo của công ty.
   */
  @IsString({ message: 'Logo phải là chuỗi' })
  @IsOptional()
  @Length(1, 500, { message: 'Độ dài logo tối đa 500 ký tự' })
  logo?: string;

  @ApiPropertyOptional({
    description: 'Website công ty',
    example: 'https://abc-new.com',
  })
  /**
   * Địa chỉ website của công ty.
   */
  @IsString({ message: 'Website phải là chuỗi' })
  @IsOptional()
  @Length(1, 255, { message: 'Độ dài website tối đa 255 ký tự' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ trụ sở công ty',
    example: '456 Đường Y, Quận 3, TP. HCM',
  })
  /**
   * Địa chỉ chi tiết.
   */
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsOptional()
  @Length(1, 255, { message: 'Độ dài địa chỉ tối đa 255 ký tự' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Giới thiệu ngắn về doanh nghiệp',
    example: 'Nhà phát triển giải pháp AI hàng đầu...',
  })
  /**
   * Mô tả chi tiết công việc hoặc nội dung.
   */
  @IsString({ message: 'Giới thiệu phải là chuỗi' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Quy mô công ty (số lượng nhân viên)',
    example: '500-1000 nhân viên',
  })
  /**
   * Quy mô nhân sự của công ty.
   */
  @IsString({ message: 'Quy mô phải là chuỗi' })
  @IsOptional()
  @Length(1, 100, { message: 'Độ dài quy mô tối đa 100 ký tự' })
  companySize?: string;
}
