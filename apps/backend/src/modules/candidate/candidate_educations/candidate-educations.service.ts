import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { CandidateEducation } from './entities/candidate-education.entity';
import { CreateCandidateEducationDto } from './dto/create-candidate-education.dto';
import { UpdateCandidateEducationDto } from './dto/update-candidate-education.dto';
import { CandidateProfilesService } from '@/modules/candidate/candidate_profiles/candidate-profiles.service';
import { CandidateEducationResponse } from './response/candidate-educations.response';

@Injectable()
export class CandidateEducationsService extends BaseService {
  constructor(
    @InjectRepository(CandidateEducation)
    private readonly candidateEducationRepository: Repository<CandidateEducation>,
    private readonly candidateProfilesService: CandidateProfilesService,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: CandidateEducation): CandidateEducationResponse {
    return plainToInstance(CandidateEducationResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateCandidateEducationDto): Promise<ResponseHttp<void>> {
    // Verify candidate profile exists
    const profileResponse = await this.candidateProfilesService.findOne(dto.profileId);
    if (!profileResponse || !profileResponse.data) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    }

    const edu = new CandidateEducation();
    edu.profileId = dto.profileId;
    edu.schoolName = dto.schoolName;
    edu.major = dto.major;
    edu.degree = dto.degree;
    edu.startDate = new Date(dto.startDate);
    if (dto.endDate) edu.endDate = new Date(dto.endDate);
    edu.description = dto.description;

    this.setAuditForCreate(edu);

    await this.candidateEducationRepository.save(edu);
    return ResponseHttp.success({
      message: 'Thêm thông tin học vấn thành công',
    });
  }

  async findByProfileId(profileId: number): Promise<ResponseHttp<CandidateEducationResponse[]>> {
    const educations = await this.candidateEducationRepository.find({
      where: { profileId },
      order: { startDate: 'DESC' },
    });
    const data = educations.map((entity) => this.toResponse(entity));
    return ResponseHttp.success({
      message: 'Lấy lịch sử học vấn thành công',
      data,
    });
  }

  async findOne(id: number): Promise<ResponseHttp<CandidateEducationResponse>> {
    const edu = await this.candidateEducationRepository.findOne({
      where: { id },
    });
    if (!edu) {
      throw new NotFoundException('Không tìm thấy thông tin học vấn này');
    }
    return ResponseHttp.success({
      message: 'Lấy thông tin học vấn thành công',
      data: this.toResponse(edu),
    });
  }

  async update(
    id: number,
    dto: UpdateCandidateEducationDto,
  ): Promise<ResponseHttp<void>> {
    const edu = await this.candidateEducationRepository.findOne({
      where: { id },
    });
    if (!edu) {
      throw new NotFoundException('Không tìm thấy thông tin học vấn này');
    }

    if (dto.profileId !== undefined) {
      const profileResponse = await this.candidateProfilesService.findOne(
        dto.profileId,
      );
      if (!profileResponse || !profileResponse.data) {
        throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
      }
      edu.profileId = dto.profileId;
    }

    if (dto.schoolName !== undefined) edu.schoolName = dto.schoolName;
    if (dto.major !== undefined) edu.major = dto.major;
    if (dto.degree !== undefined) edu.degree = dto.degree;
    if (dto.startDate !== undefined) edu.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      edu.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.description !== undefined) edu.description = dto.description;

    this.setAuditForUpdate(edu);

    await this.candidateEducationRepository.save(edu);
    return ResponseHttp.success({
      message: 'Cập nhật thông tin học vấn thành công',
    });
  }

  async remove(id: number): Promise<ResponseHttp<void>> {
    const edu = await this.candidateEducationRepository.findOne({
      where: { id },
    });
    if (!edu) {
      throw new NotFoundException('Không tìm thấy thông tin học vấn này');
    }
    await this.candidateEducationRepository.remove(edu);
    return ResponseHttp.success({
      message: 'Xóa thông tin học vấn thành công',
    });
  }
}
