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
import { CandidateCvsService } from './candidate-cvs.service';
import { CreateCandidateCvDto } from './dto/create-candidate-cv.dto';
import { UpdateCandidateCvDto } from './dto/update-candidate-cv.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { CandidateCvResponse } from './response/candidate-cvs.response';

@ApiTags('Candidate CVs')
@ApiBearerAuth()
@Controller('candidate-cvs')
export class CandidateCvsController {
  constructor(private readonly candidateCvsService: CandidateCvsService) {}

  @Post()
  @ApiOperation({
    summary: 'Thêm CV mới cho ứng viên',
    description: 'Thêm một file CV mới vào danh sách CV của ứng viên.',
  })
  async create(@Body() createDto: CreateCandidateCvDto): Promise<ResponseHttp<void>> {
    return this.candidateCvsService.create(createDto);
  }

  @Get('profile/:profileId')
  @ApiOperation({
    summary: 'Lấy danh sách CV theo Profile ID',
    description: 'Lấy toàn bộ danh sách file CV của ứng viên theo Profile ID.',
  })
  async findByProfileId(
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<ResponseHttp<CandidateCvResponse[]>> {
    return this.candidateCvsService.findByProfileId(profileId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết một CV',
    description: 'Lấy thông tin chi tiết của một CV theo ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<CandidateCvResponse>> {
    return this.candidateCvsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin CV',
    description:
      'Cập nhật thông tin chi tiết của CV (như URL, mô tả, đánh dấu CV chính).',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCandidateCvDto,
  ): Promise<ResponseHttp<void>> {
    return this.candidateCvsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa CV',
    description: 'Xóa soft-delete một bản CV của ứng viên khỏi danh sách.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.candidateCvsService.remove(id);
  }
}

