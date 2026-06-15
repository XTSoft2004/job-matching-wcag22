import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobSkillsService } from './job-skills.service';
import { CreateJobSkillDto } from './dto/create-job-skill.dto';
import { UpdateJobSkillDto } from './dto/update-job-skill.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { JobSkillResponse } from './response/job-skills.response';

@ApiTags('Job Skills')
@ApiBearerAuth()
@Controller('job-skills')
export class JobSkillsController {
  constructor(private readonly jobSkillsService: JobSkillsService) {}

  @Post()
  @ApiOperation({
    summary: 'Thêm kỹ năng vào tin tuyển dụng',
    description: 'Thêm một kỹ năng chuyên môn yêu cầu mới vào tin tuyển dụng.',
  })
  async create(@Body() createDto: CreateJobSkillDto): Promise<ResponseHttp<void>> {
    return this.jobSkillsService.create(createDto);
  }

  @Get('job/:jobId')
  @ApiOperation({
    summary: 'Lấy danh sách kỹ năng theo Job ID',
    description: 'Lấy toàn bộ các kỹ năng yêu cầu của một tin tuyển dụng.',
  })
  async findByJobId(
    @Param('jobId', ParseIntPipe) jobId: number,
  ): Promise<ResponseHttp<JobSkillResponse[]>> {
    return this.jobSkillsService.findByJobId(jobId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết một kỹ năng tin tuyển dụng',
    description: 'Lấy thông tin chi tiết một liên kết kỹ năng theo ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<JobSkillResponse>> {
    return this.jobSkillsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin kỹ năng tin tuyển dụng',
    description:
      'Cập nhật tên hoặc khoảng kinh nghiệm của kỹ năng tuyển dụng theo ID.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateJobSkillDto,
  ): Promise<ResponseHttp<void>> {
    return this.jobSkillsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa kỹ năng khỏi tin tuyển dụng',
    description: 'Xóa một kỹ năng ra khỏi tin tuyển dụng.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.jobSkillsService.remove(id);
  }
}

