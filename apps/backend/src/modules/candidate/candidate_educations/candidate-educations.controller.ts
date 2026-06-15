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
import { CandidateEducationsService } from './candidate-educations.service';
import { CreateCandidateEducationDto } from './dto/create-candidate-education.dto';
import { UpdateCandidateEducationDto } from './dto/update-candidate-education.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { CandidateEducationResponse } from './response/candidate-educations.response';

@ApiTags('Candidate Educations')
@ApiBearerAuth()
@Controller('candidate-educations')
export class CandidateEducationsController {
  constructor(
    private readonly candidateEducationsService: CandidateEducationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Thêm học vấn/chứng chỉ mới',
    description:
      'Thêm thông tin một mốc học vấn hoặc bằng cấp vào hồ sơ ứng viên.',
  })
  async create(@Body() createDto: CreateCandidateEducationDto): Promise<ResponseHttp<void>> {
    return this.candidateEducationsService.create(createDto);
  }

  @Get('profile/:profileId')
  @ApiOperation({
    summary: 'Lấy lịch sử học vấn theo Profile ID',
    description: 'Lấy danh sách tất cả các mốc học vấn của một hồ sơ ứng viên.',
  })
  async findByProfileId(
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<ResponseHttp<CandidateEducationResponse[]>> {
    return this.candidateEducationsService.findByProfileId(profileId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết một mốc học vấn',
    description: 'Lấy thông tin chi tiết của một mốc học vấn theo ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<CandidateEducationResponse>> {
    return this.candidateEducationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật mốc học vấn',
    description: 'Cập nhật thông tin học vấn hoặc bằng cấp theo ID.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCandidateEducationDto,
  ): Promise<ResponseHttp<void>> {
    return this.candidateEducationsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa mốc học vấn',
    description: 'Xóa soft-delete một mốc học vấn ra khỏi hồ sơ.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.candidateEducationsService.remove(id);
  }
}

