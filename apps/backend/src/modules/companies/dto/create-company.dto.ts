import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Tên công ty/doanh nghiệp',
    example: 'Công ty Công nghệ ABC',
  })
  @IsString({ message: 'Tên công ty phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  @Length(1, 255, { message: 'Tên công ty từ 1 đến 255 ký tự' })
  name: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh logo công ty',
    example: 'https://example.com/logo.png',
  })
  @IsString({ message: 'Logo phải là chuỗi' })
  @IsOptional()
  @Length(1, 500, { message: 'Độ dài logo tối đa 500 ký tự' })
  logo?: string;

  @ApiPropertyOptional({
    description: 'Website công ty',
    example: 'https://abc.com',
  })
  @IsString({ message: 'Website phải là chuỗi' })
  @IsOptional()
  @Length(1, 255, { message: 'Độ dài website tối đa 255 ký tự' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ trụ sở công ty',
    example: '123 Đường X, Quận 1, TP. HCM',
  })
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsOptional()
  @Length(1, 255, { message: 'Độ dài địa chỉ tối đa 255 ký tự' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Giới thiệu ngắn về doanh nghiệp',
    example: 'Chuyên sản xuất phần mềm chất lượng cao...',
  })
  @IsString({ message: 'Giới thiệu phải là chuỗi' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Quy mô công ty (số lượng nhân viên)',
    example: '100-500 nhân viên',
  })
  @IsString({ message: 'Quy mô phải là chuỗi' })
  @IsOptional()
  @Length(1, 100, { message: 'Độ dài quy mô tối đa 100 ký tự' })
  companySize?: string;
}
