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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import { UserResponse, UserPaginatedResponse } from './response/users.response';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo người dùng mới',
    description: 'Tạo một tài khoản người dùng mới trong hệ thống.',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseHttp<void>> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách người dùng',
    description: 'Lấy danh sách tất cả người dùng kèm phân trang và tìm kiếm.',
  })
  async findAll(@Query() query: BasePaginateQuery): Promise<UserPaginatedResponse> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết người dùng',
    description:
      'Tìm kiếm và trả về thông tin chi tiết của một người dùng theo ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<UserResponse>> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin người dùng',
    description: 'Cập nhật thông tin tài khoản người dùng theo ID.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseHttp<void>> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa người dùng',
    description: 'Xóa vĩnh viễn tài khoản người dùng ra khỏi hệ thống theo ID.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseHttp<void>> {
    return this.usersService.remove(id);
  }
}

