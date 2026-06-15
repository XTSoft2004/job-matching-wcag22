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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import { JobResponse, JobPaginatedResponse } from './response/jobs.response';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo tin tuyển dụng mới',
    description: 'Tạo một tin tuyển dụng mới cho công ty.',
  })
  async create(@Body() createDto: CreateJobDto): Promise<ResponseHttp<void>> {
    return this.jobsService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tin tuyển dụng',
    description: 'Lấy danh sách tin tuyển dụng có phân trang và tìm kiếm.',
  })
  async findAll(@Query() query: BasePaginateQuery): Promise<JobPaginatedResponse> {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết tin tuyển dụng',
    description: 'Lấy thông tin chi tiết một tin tuyển dụng theo ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<JobResponse>> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật tin tuyển dụng',
    description: 'Cập nhật thông tin tin tuyển dụng theo ID.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateJobDto,
  ): Promise<ResponseHttp<void>> {
    return this.jobsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa tin tuyển dụng',
    description: 'Xóa một tin tuyển dụng theo ID (soft delete).',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.jobsService.remove(id);
  }
}

