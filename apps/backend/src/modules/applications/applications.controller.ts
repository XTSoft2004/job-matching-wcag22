import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { FindAllApplicationsDto } from './dto/find-all-applications.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { ApplicationResponse, ApplicationPaginatedResponse } from './response/applications.response';
import { RolesGuard } from '@/modules/authenticator/guards/roles.guard';
import { Roles } from '@/modules/authenticator/decorators/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({
    summary: 'Nộp đơn ứng tuyển mới',
    description: 'Ứng viên nộp đơn ứng tuyển kèm thư giới thiệu và CV được chọn.',
  })
  async create(
    @Body() createDto: CreateApplicationDto,
  ): Promise<ResponseHttp<void>> {
    return this.applicationsService.create(createDto);
  }

  @Get()
  @Roles(UserRole.CANDIDATE, UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy danh sách đơn ứng tuyển',
    description: 'Lấy danh sách đơn ứng tuyển có phân trang và bộ lọc theo phân quyền người dùng.',
  })
  async findAll(
    @Query() query: FindAllApplicationsDto,
  ): Promise<ApplicationPaginatedResponse> {
    return this.applicationsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.CANDIDATE, UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết đơn ứng tuyển',
    description: 'Lấy chi tiết thông tin đơn ứng tuyển theo ID kèm quan hệ liên quan.',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseHttp<ApplicationResponse>> {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.CANDIDATE, UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Cập nhật đơn ứng tuyển',
    description: 'Ứng viên cập nhật thông tin hồ sơ/CV/thư giới thiệu. Nhà tuyển dụng/Admin cập nhật trạng thái tuyển dụng hoặc ghi chú nội bộ.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateApplicationDto,
  ): Promise<ResponseHttp<void>> {
    return this.applicationsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.CANDIDATE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Rút đơn hoặc xóa đơn ứng tuyển',
    description: 'Ứng viên tự rút đơn đã nộp (Xóa mềm) hoặc Admin xóa bản ghi.',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseHttp<void>> {
    return this.applicationsService.remove(id);
  }
}
