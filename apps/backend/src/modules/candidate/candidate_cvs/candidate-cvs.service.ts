import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { CandidateCv } from './entities/candidate-cv.entity';
import { CreateCandidateCvDto } from './dto/create-candidate-cv.dto';
import { UpdateCandidateCvDto } from './dto/update-candidate-cv.dto';
import { CandidateProfilesService } from '@/modules/candidate/candidate_profiles/candidate-profiles.service';
import { ResponseHttp } from '@/common/utils/response.util';
import { CandidateCvResponse } from './response/candidate-cvs.response';

@Injectable()
export class CandidateCvsService extends BaseService {
  constructor(
    @InjectRepository(CandidateCv)
    private readonly candidateCvRepository: Repository<CandidateCv>,
    private readonly candidateProfilesService: CandidateProfilesService,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: CandidateCv): CandidateCvResponse {
    return plainToInstance(CandidateCvResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateCandidateCvDto): Promise<ResponseHttp<void>> {
    const profileResponse = await this.candidateProfilesService.findOne(dto.profileId);
    const profile = profileResponse.data;
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    }

    const existingCvsCount = await this.candidateCvRepository.count({
      where: { profileId: dto.profileId },
    });

    const cv = new CandidateCv();
    cv.profileId = dto.profileId;
    cv.cvUrl = dto.cvUrl;
    cv.description = dto.description;

    this.setAuditForCreate(cv);
    await this.candidateCvRepository.save(cv);
    return ResponseHttp.success({
      message: 'Thêm CV thành công',
    });
  }

  async findByProfileId(profileId: number): Promise<ResponseHttp<CandidateCvResponse[]>> {
    const cvs = await this.candidateCvRepository.find({
      where: { profileId },
      order: { createdAt: 'DESC' },
    });
    return ResponseHttp.success({
      message: 'Lấy danh sách CV thành công',
      data: cvs.map((entity) => this.toResponse(entity)),
    });
  }

  async findOne(id: number): Promise<ResponseHttp<CandidateCvResponse>> {
    const cv = await this.candidateCvRepository.findOne({ where: { id } });
    if (!cv) {
      throw new NotFoundException('Không tìm thấy thông tin CV này');
    }
    return ResponseHttp.success({
      message: 'Lấy thông tin chi tiết CV thành công',
      data: this.toResponse(cv),
    });
  }

  async update(id: number, dto: UpdateCandidateCvDto): Promise<ResponseHttp<void>> {
    const cv = await this.candidateCvRepository.findOne({ where: { id } });
    if (!cv) {
      throw new NotFoundException('Không tìm thấy thông tin CV này');
    }

    if (dto.profileId !== undefined) {
      const profileResponse = await this.candidateProfilesService.findOne(
        dto.profileId,
      );
      const profile = profileResponse.data;
      if (!profile) {
        throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
      }
      cv.profileId = dto.profileId;
    }

    if (dto.cvUrl !== undefined) cv.cvUrl = dto.cvUrl;
    if (dto.description !== undefined) cv.description = dto.description;

    this.setAuditForUpdate(cv);
    await this.candidateCvRepository.save(cv);
    return ResponseHttp.success({
      message: 'Cập nhật thông tin CV thành công',
    });
  }

  async remove(id: number): Promise<ResponseHttp<void>> {
    const cv = await this.candidateCvRepository.findOne({ where: { id } });
    if (!cv) {
      throw new NotFoundException('Không tìm thấy thông tin CV này');
    }

    await this.candidateCvRepository.softRemove(cv);

    return ResponseHttp.success({
      message: 'Xóa CV thành công',
    });
  }
}
