import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { CandidateExperience } from './entities/candidate-experience.entity';
import { CreateCandidateExperienceDto } from './dto/create-candidate-experience.dto';
import { UpdateCandidateExperienceDto } from './dto/update-candidate-experience.dto';
import { CandidateProfilesService } from '@/modules/candidate/candidate_profiles/candidate-profiles.service';
import { CandidateExperienceResponse } from './response/candidate-experiences.response';

@Injectable()
export class CandidateExperiencesService extends BaseService {
  constructor(
    @InjectRepository(CandidateExperience)
    private readonly candidateExperienceRepository: Repository<CandidateExperience>,
    private readonly candidateProfilesService: CandidateProfilesService,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: CandidateExperience): CandidateExperienceResponse {
    return plainToInstance(CandidateExperienceResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    dto: CreateCandidateExperienceDto,
  ): Promise<ResponseHttp<void>> {
    // Verify candidate profile exists
    const profileResponse = await this.candidateProfilesService.findOne(dto.profileId);
    if (!profileResponse || !profileResponse.data) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    }

    const exp = new CandidateExperience();
    exp.profileId = dto.profileId;
    exp.companyName = dto.companyName;
    exp.position = dto.position;
    exp.startDate = new Date(dto.startDate);
    if (dto.endDate) exp.endDate = new Date(dto.endDate);
    exp.description = dto.description;

    this.setAuditForCreate(exp);

    await this.candidateExperienceRepository.save(exp);
    return ResponseHttp.success({
      message: 'Thêm kinh nghiệm làm việc thành công',
    });
  }

  async findByProfileId(profileId: number): Promise<ResponseHttp<CandidateExperienceResponse[]>> {
    const experiences = await this.candidateExperienceRepository.find({
      where: { profileId },
      order: { startDate: 'DESC' },
    });
    const data = experiences.map((entity) => this.toResponse(entity));
    return ResponseHttp.success({
      message: 'Lấy danh sách kinh nghiệm làm việc thành công',
      data,
    });
  }

  async findOne(id: number): Promise<ResponseHttp<CandidateExperienceResponse>> {
    const exp = await this.candidateExperienceRepository.findOne({
      where: { id },
    });
    if (!exp) {
      throw new NotFoundException('Không tìm thấy thông tin kinh nghiệm này');
    }
    return ResponseHttp.success({
      message: 'Lấy thông tin kinh nghiệm làm việc thành công',
      data: this.toResponse(exp),
    });
  }

  async update(
    id: number,
    dto: UpdateCandidateExperienceDto,
  ): Promise<ResponseHttp<void>> {
    const exp = await this.candidateExperienceRepository.findOne({
      where: { id },
    });
    if (!exp) {
      throw new NotFoundException('Không tìm thấy thông tin kinh nghiệm này');
    }

    if (dto.profileId !== undefined) {
      const profileResponse = await this.candidateProfilesService.findOne(
        dto.profileId,
      );
      if (!profileResponse || !profileResponse.data) {
        throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
      }
      exp.profileId = dto.profileId;
    }

    if (dto.companyName !== undefined) exp.companyName = dto.companyName;
    if (dto.position !== undefined) exp.position = dto.position;
    if (dto.startDate !== undefined) exp.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      exp.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.description !== undefined) exp.description = dto.description;

    this.setAuditForUpdate(exp);

    await this.candidateExperienceRepository.save(exp);
    return ResponseHttp.success({
      message: 'Cập nhật kinh nghiệm làm việc thành công',
    });
  }

  async remove(id: number): Promise<ResponseHttp<void>> {
    const exp = await this.candidateExperienceRepository.findOne({
      where: { id },
    });
    if (!exp) {
      throw new NotFoundException('Không tìm thấy thông tin kinh nghiệm này');
    }
    await this.candidateExperienceRepository.remove(exp);
    return ResponseHttp.success({
      message: 'Xóa kinh nghiệm làm việc thành công',
    });
  }
}
