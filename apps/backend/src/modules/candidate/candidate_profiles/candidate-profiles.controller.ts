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
import { CandidateProfilesService } from './candidate-profiles.service';
import { CreateCandidateProfileDto } from './dto/create-candidate-profile.dto';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import {
  CandidateProfileResponse,
  CandidateProfilePaginatedResponse,
} from './response/candidate-profiles.response';

@ApiTags('Candidate Profiles')
@ApiBearerAuth()
@Controller('candidate-profiles')
export class CandidateProfilesController {
  constructor(
    private readonly candidateProfilesService: CandidateProfilesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo hồ sơ ứng viên mới',
    description: 'Tạo một hồ sơ cá nhân mới cho tài khoản ứng viên.',
  })
  async create(
    @Body() createCandidateProfileDto: CreateCandidateProfileDto,
  ): Promise<ResponseHttp<void>> {
    return this.candidateProfilesService.create(createCandidateProfileDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách hồ sơ ứng viên',
    description: 'Lấy danh sách các hồ sơ ứng viên kèm phân trang và tìm kiếm.',
  })
  async findAll(@Query() query: BasePaginateQuery): Promise<CandidateProfilePaginatedResponse> {
    return this.candidateProfilesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết hồ sơ ứng viên theo ID',
    description:
      'Tìm kiếm và trả về thông tin hồ sơ ứng viên chi tiết (kèm kinh nghiệm, học vấn, kỹ năng).',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<CandidateProfileResponse>> {
    return this.candidateProfilesService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Lấy chi tiết hồ sơ ứng viên theo User ID',
    description: 'Tìm kiếm hồ sơ ứng viên liên kết với User ID cụ thể.',
  })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<ResponseHttp<CandidateProfileResponse>> {
    return this.candidateProfilesService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật hồ sơ ứng viên',
    description: 'Cập nhật thông tin hồ sơ cá nhân của ứng viên.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCandidateProfileDto: UpdateCandidateProfileDto,
  ): Promise<ResponseHttp<void>> {
    return this.candidateProfilesService.update(id, updateCandidateProfileDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa hồ sơ ứng viên',
    description: 'Xóa soft-delete hồ sơ ứng viên theo ID.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.candidateProfilesService.remove(id);
  }
}

