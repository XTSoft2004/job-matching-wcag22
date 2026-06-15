import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { CandidateProfile } from './entities/candidate-profile.entity';
import { CreateCandidateProfileDto } from './dto/create-candidate-profile.dto';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';
import { UsersService } from '@/modules/users/users.service';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import {
  CandidateProfileResponse,
  CandidateProfilePaginatedResponse,
} from './response/candidate-profiles.response';

@Injectable()
export class CandidateProfilesService extends BaseService {
  constructor(
    @InjectRepository(CandidateProfile)
    private readonly candidateProfileRepository: Repository<CandidateProfile>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: CandidateProfile): CandidateProfileResponse {
    return plainToInstance(CandidateProfileResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateCandidateProfileDto): Promise<ResponseHttp<void>> {
    const existing = await this.candidateProfileRepository.findOne({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('Hồ sơ ứng viên cho tài khoản này đã tồn tại');
    }

    const profile = this.candidateProfileRepository.create(dto);
    this.setAuditForCreate(profile);
    await this.candidateProfileRepository.save(profile);
    return ResponseHttp.success({
      message: 'Tạo hồ sơ ứng viên thành công',
    });
  }

  async findAll(
    query: BasePaginateQuery,
  ): Promise<CandidateProfilePaginatedResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';

    const queryBuilder = this.candidateProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user');

    if (search) {
      queryBuilder.where(
        'profile.title LIKE :search OR profile.province LIKE :search OR user.fullName LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('profile.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const profileResponses = data.map((entity) => this.toResponse(entity));

    return ResponseHttp.success({
      message: 'Lấy danh sách hồ sơ ứng viên thành công',
      data: profileResponses,
      meta: {
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async findOne(id: number): Promise<ResponseHttp<CandidateProfileResponse>> {
    const profile = await this.candidateProfileRepository.findOne({
      where: { id },
      relations: {
        user: true,
        experiences: true,
        educations: true,
        skills: true,
        cvs: true,
      },
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    }
    return ResponseHttp.success({
      message: 'Lấy chi tiết hồ sơ ứng viên thành công',
      data: this.toResponse(profile),
    });
  }

  async findByUserId(userId: number): Promise<ResponseHttp<CandidateProfileResponse>> {
    const profile = await this.candidateProfileRepository.findOne({
      where: { userId },
      relations: {
        user: true,
        experiences: true,
        educations: true,
        skills: true,
        cvs: true,
      },
    });
    if (!profile) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ ứng viên cho tài khoản này',
      );
    }
    return ResponseHttp.success({
      message: 'Lấy hồ sơ ứng viên theo User ID thành công',
      data: this.toResponse(profile),
    });
  }

  async update(
    id: number,
    dto: UpdateCandidateProfileDto,
  ): Promise<ResponseHttp<void>> {
    const profile = await this.candidateProfileRepository.findOne({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    }

    if (dto.title !== undefined) profile.title = dto.title;
    if (dto.summary !== undefined) profile.summary = dto.summary;
    if (dto.dateOfBirth !== undefined)
      profile.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    if (dto.gender !== undefined) profile.gender = dto.gender;
    if (dto.address !== undefined) profile.address = dto.address;
    if (dto.province !== undefined) profile.province = dto.province;
    if (dto.experienceLevel !== undefined)
      profile.experienceLevel = dto.experienceLevel;
    if (dto.expectedSalaryMin !== undefined)
      profile.expectedSalaryMin = dto.expectedSalaryMin;
    if (dto.expectedSalaryMax !== undefined)
      profile.expectedSalaryMax = dto.expectedSalaryMax;
    if (dto.isOpenToWork !== undefined) profile.isOpenToWork = dto.isOpenToWork;

    this.setAuditForUpdate(profile);

    await this.candidateProfileRepository.save(profile);
    return ResponseHttp.success({
      message: 'Cập nhật hồ sơ ứng viên thành công',
    });
  }

  async remove(id: number): Promise<ResponseHttp<void>> {
    const profile = await this.candidateProfileRepository.findOne({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    }
    await this.candidateProfileRepository.softRemove(profile);
    return ResponseHttp.success({
      message: 'Xóa hồ sơ ứng viên thành công',
    });
  }
}
