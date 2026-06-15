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
import { CandidateSkillsService } from './candidate-skills.service';
import { CreateCandidateSkillDto } from './dto/create-candidate-skill.dto';
import { UpdateCandidateSkillDto } from './dto/update-candidate-skill.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { CandidateSkillResponse } from './response/candidate-skills.response';

@ApiTags('Candidate Skills')
@ApiBearerAuth()
@Controller('candidate-skills')
export class CandidateSkillsController {
  constructor(
    private readonly candidateSkillsService: CandidateSkillsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Thêm kỹ năng vào hồ sơ',
    description:
      'Thêm một kỹ năng chuyên môn mới vào hồ sơ cá nhân của ứng viên.',
  })
  async create(@Body() createDto: CreateCandidateSkillDto): Promise<ResponseHttp<void>> {
    return this.candidateSkillsService.create(createDto);
  }

  @Get('profile/:profileId')
  @ApiOperation({
    summary: 'Lấy danh sách kỹ năng theo Profile ID',
    description: 'Lấy toàn bộ các kỹ năng đã đăng ký của một hồ sơ ứng viên.',
  })
  async findByProfileId(
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<ResponseHttp<CandidateSkillResponse[]>> {
    return this.candidateSkillsService.findByProfileId(profileId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết một kỹ năng',
    description: 'Lấy thông tin chi tiết một liên kết kỹ năng theo ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<CandidateSkillResponse>> {
    return this.candidateSkillsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin kỹ năng',
    description: 'Cập nhật tên kỹ năng hoặc hồ sơ liên kết theo ID.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCandidateSkillDto,
  ): Promise<ResponseHttp<void>> {
    return this.candidateSkillsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa kỹ năng khỏi hồ sơ',
    description: 'Xóa một kỹ năng ra khỏi hồ sơ của ứng viên.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.candidateSkillsService.remove(id);
  }
}

