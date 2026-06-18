import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashUtil } from '@/common/utils/hash.util';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import { UserResponse, UserPaginatedResponse } from './response/users.response';

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: User): UserResponse {
    return plainToInstance(UserResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  async createRaw(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const passwordHash = await HashUtil.hash(dto.password);
    const user = this.userRepository.create({
      ...dto,
      passwordHash,
    });
    this.setAuditForCreate(user);

    return this.userRepository.save(user);
  }

  async create(dto: CreateUserDto): Promise<ResponseHttp<void>> {
    await this.createRaw(dto);
    return ResponseHttp.success({
      message: 'Tạo người dùng mới thành công',
    });
  }

  async findAll(
    query: BasePaginateQuery,
  ): Promise<UserPaginatedResponse> {
    const { page = 1, limit = 10, search } = query;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        'user.fullName ILIKE :search OR user.email ILIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const userResponses = data.map((entity) => this.toResponse(entity));

    return ResponseHttp.success({
      message: 'Lấy danh sách người dùng thành công',
      data: userResponses,
      meta: {
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async findOne(id: number): Promise<ResponseHttp<UserResponse>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return ResponseHttp.success({
      message: 'Lấy thông tin chi tiết người dùng thành công',
      data: this.toResponse(user),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateRaw(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email đã được sử dụng');
      }
      user.email = dto.email;
    }

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.avatarUrl) user.avatarUrl = dto.avatarUrl;
    if (dto.avatar) user.avatarUrl = dto.avatar;
    if (dto.role) user.role = dto.role;
    if (dto.status) user.status = dto.status;

    if (dto.password) {
      user.passwordHash = await HashUtil.hash(dto.password);
    }

    // Set update audit log info
    this.setAuditForUpdate(user);

    return this.userRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<ResponseHttp<void>> {
    await this.updateRaw(id, dto);
    return ResponseHttp.success({
      message: 'Cập nhật thông tin người dùng thành công',
    });
  }

  async remove(id: number): Promise<ResponseHttp<void>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    await this.userRepository.softRemove(user);
    return ResponseHttp.success({
      message: 'Xóa người dùng thành công',
    });
  }
}
