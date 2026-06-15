import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import { CompanyResponse, CompanyPaginatedResponse } from './response/companies.response';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo công ty mới',
    description: 'Thêm một hồ sơ công ty mới vào hệ thống.',
  })
  async create(@Body() createDto: CreateCompanyDto): Promise<ResponseHttp<void>> {
    return this.companiesService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách công ty',
    description:
      'Lấy danh sách toàn bộ công ty có phân trang và bộ lọc tìm kiếm.',
  })
  async findAll(@Query() query: BasePaginateQuery): Promise<CompanyPaginatedResponse> {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết công ty',
    description:
      'Lấy thông tin chi tiết một công ty theo ID (kèm danh sách tài khoản thuộc công ty).',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<CompanyResponse>> {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin công ty',
    description: 'Cập nhật các thuộc tính chi tiết của hồ sơ công ty.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCompanyDto,
  ): Promise<ResponseHttp<void>> {
    return this.companiesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa công ty',
    description: 'Xóa soft-delete một công ty khỏi hệ thống theo ID.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.companiesService.remove(id);
  }
}

