import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { ResponseHttp } from '@/common/utils/response.util';
import { CandidateSkill } from './entities/candidate-skill.entity';
import { CreateCandidateSkillDto } from './dto/create-candidate-skill.dto';
import { UpdateCandidateSkillDto } from './dto/update-candidate-skill.dto';
import { CandidateProfilesService } from '@/modules/candidate/candidate_profiles/candidate-profiles.service';
import { CandidateSkillResponse } from './response/candidate-skills.response';

@Injectable()
export class CandidateSkillsService extends BaseService {
  constructor(
    @InjectRepository(CandidateSkill)
    private readonly candidateSkillRepository: Repository<CandidateSkill>,
    private readonly candidateProfilesService: CandidateProfilesService,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: CandidateSkill): CandidateSkillResponse {
    return plainToInstance(CandidateSkillResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Thêm một kỹ năng mới vào hồ sơ ứng viên.
   */
  async create(dto: CreateCandidateSkillDto): Promise<ResponseHttp<void>> {
    // Xác minh hồ sơ ứng viên tồn tại
    const profileResponse = await this.candidateProfilesService.findOne(dto.profileId);
    if (!profileResponse || !profileResponse.data) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    }

    // Xác thực khoảng kinh nghiệm
    if (dto.experienceStart !== undefined && dto.experienceEnd !== undefined) {
      if (dto.experienceStart > dto.experienceEnd) {
        throw new BadRequestException(
          'Kinh nghiệm bắt đầu không được lớn hơn kinh nghiệm kết thúc',
        );
      }
    }

    // Tránh trùng lặp kỹ năng theo tên trong cùng một hồ sơ
    const existingSkill = await this.candidateSkillRepository.findOne({
      where: { profileId: dto.profileId, name: dto.name },
    });
    if (existingSkill) {
      throw new ConflictException('Kỹ năng này đã tồn tại trong hồ sơ');
    }

    const skill = new CandidateSkill();
    skill.profileId = dto.profileId;
    skill.name = dto.name;
    skill.experienceStart = dto.experienceStart;
    skill.experienceEnd = dto.experienceEnd;

    this.setAuditForCreate(skill);

    await this.candidateSkillRepository.save(skill);
    return ResponseHttp.success({
      message: 'Thêm kỹ năng thành công',
    });
  }

  /**
   * Lấy danh sách kỹ năng của hồ sơ ứng viên theo Profile ID.
   */
  async findByProfileId(profileId: number): Promise<ResponseHttp<CandidateSkillResponse[]>> {
    const skills = await this.candidateSkillRepository.find({
      where: { profileId },
      order: { name: 'ASC' },
    });
    const data = skills.map((entity) => this.toResponse(entity));
    return ResponseHttp.success({
      message: 'Lấy danh sách kỹ năng thành công',
      data,
    });
  }

  /**
   * Lấy thông tin chi tiết một kỹ năng của ứng viên theo ID.
   */
  async findOne(id: number): Promise<ResponseHttp<CandidateSkillResponse>> {
    const skill = await this.candidateSkillRepository.findOne({
      where: { id },
    });
    if (!skill) {
      throw new NotFoundException('Không tìm thấy liên kết kỹ năng này');
    }
    return ResponseHttp.success({
      message: 'Lấy thông tin kỹ năng thành công',
      data: this.toResponse(skill),
    });
  }

  /**
   * Cập nhật thông tin kỹ năng của ứng viên.
   */
  async update(
    id: number,
    dto: UpdateCandidateSkillDto,
  ): Promise<ResponseHttp<void>> {
    const skill = await this.candidateSkillRepository.findOne({
      where: { id },
    });
    if (!skill) {
      throw new NotFoundException('Không tìm thấy liên kết kỹ năng này');
    }

    if (dto.profileId !== undefined) {
      const profileResponse = await this.candidateProfilesService.findOne(
        dto.profileId,
      );
      if (!profileResponse || !profileResponse.data) {
        throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
      }
      skill.profileId = dto.profileId;
    }

    if (dto.name !== undefined) {
      skill.name = dto.name;
    }

    if (dto.experienceStart !== undefined) {
      skill.experienceStart = dto.experienceStart;
    }

    if (dto.experienceEnd !== undefined) {
      skill.experienceEnd = dto.experienceEnd;
    }

    // Xác thực khoảng kinh nghiệm sau khi cập nhật
    if (
      skill.experienceStart !== undefined &&
      skill.experienceEnd !== undefined
    ) {
      if (skill.experienceStart > skill.experienceEnd) {
        throw new BadRequestException(
          'Kinh nghiệm bắt đầu không được lớn hơn kinh nghiệm kết thúc',
        );
      }
    }

    // Kiểm tra trùng lặp sau khi thay đổi tên hoặc profile
    if (dto.name !== undefined || dto.profileId !== undefined) {
      const profileId = skill.profileId;
      const name = skill.name;
      const existingSkill = await this.candidateSkillRepository.findOne({
        where: { profileId, name },
      });
      if (existingSkill && existingSkill.id !== id) {
        throw new ConflictException('Kỹ năng này đã tồn tại trong hồ sơ');
      }
    }

    this.setAuditForUpdate(skill);

    await this.candidateSkillRepository.save(skill);
    return ResponseHttp.success({
      message: 'Cập nhật kỹ năng thành công',
    });
  }

  /**
   * Xóa một kỹ năng khỏi hồ sơ ứng viên.
   */
  async remove(id: number): Promise<ResponseHttp<void>> {
    const skill = await this.candidateSkillRepository.findOne({
      where: { id },
    });
    if (!skill) {
      throw new NotFoundException('Không tìm thấy liên kết kỹ năng này');
    }
    await this.candidateSkillRepository.remove(skill);
    return ResponseHttp.success({
      message: 'Xóa kỹ năng thành công',
    });
  }
}
