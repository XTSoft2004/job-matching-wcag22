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
import { CandidateExperiencesService } from './candidate-experiences.service';
import { CreateCandidateExperienceDto } from './dto/create-candidate-experience.dto';
import { UpdateCandidateExperienceDto } from './dto/update-candidate-experience.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { CandidateExperienceResponse } from './response/candidate-experiences.response';

@ApiTags('Candidate Experiences')
@ApiBearerAuth()
@Controller('candidate-experiences')
export class CandidateExperiencesController {
  constructor(
    private readonly candidateExperiencesService: CandidateExperiencesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Thêm kinh nghiệm làm việc mới',
    description:
      'Thêm thông tin một mốc kinh nghiệm làm việc vào hồ sơ ứng viên.',
  })
  async create(@Body() createDto: CreateCandidateExperienceDto): Promise<ResponseHttp<void>> {
    return this.candidateExperiencesService.create(createDto);
  }

  @Get('profile/:profileId')
  @ApiOperation({
    summary: 'Lấy danh sách kinh nghiệm làm việc theo Profile ID',
    description: 'Lấy toàn bộ lịch sử kinh nghiệm làm việc của hồ sơ ứng viên.',
  })
  async findByProfileId(
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<ResponseHttp<CandidateExperienceResponse[]>> {
    return this.candidateExperiencesService.findByProfileId(profileId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết một mốc kinh nghiệm',
    description: 'Lấy thông tin chi tiết một mốc kinh nghiệm theo ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<CandidateExperienceResponse>> {
    return this.candidateExperiencesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật mốc kinh nghiệm',
    description: 'Cập nhật thông tin mốc kinh nghiệm làm việc.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCandidateExperienceDto,
  ): Promise<ResponseHttp<void>> {
    return this.candidateExperiencesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa mốc kinh nghiệm',
    description: 'Xóa soft-delete một mốc kinh nghiệm làm việc.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.candidateExperiencesService.remove(id);
  }
}

