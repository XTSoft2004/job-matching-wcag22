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
import { JobSkill } from './entities/job-skill.entity';
import { CreateJobSkillDto } from './dto/create-job-skill.dto';
import { UpdateJobSkillDto } from './dto/update-job-skill.dto';
import { JobsService } from '@/modules/jobs/jobs.service';
import { ResponseHttp } from '@/common/utils/response.util';
import { JobSkillResponse } from './response/job-skills.response';

@Injectable()
export class JobSkillsService extends BaseService {
  constructor(
    @InjectRepository(JobSkill)
    private readonly jobSkillRepository: Repository<JobSkill>,
    private readonly jobsService: JobsService,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: JobSkill): JobSkillResponse {
    return plainToInstance(JobSkillResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Thêm một kỹ năng yêu cầu vào tin tuyển dụng.
   */
  async create(dto: CreateJobSkillDto): Promise<ResponseHttp<void>> {
    // Xác minh tin tuyển dụng tồn tại
    const jobResponse = await this.jobsService.findOne(dto.jobId);
    const job = jobResponse.data;
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Xác thực khoảng kinh nghiệm
    if (dto.experienceStart !== undefined && dto.experienceEnd !== undefined) {
      if (dto.experienceStart > dto.experienceEnd) {
        throw new BadRequestException(
          'Kinh nghiệm bắt đầu không được lớn hơn kinh nghiệm kết thúc',
        );
      }
    }

    // Tránh trùng lặp kỹ năng theo tên trong cùng một tin tuyển dụng
    const existingSkill = await this.jobSkillRepository.findOne({
      where: { jobId: dto.jobId, name: dto.name },
    });
    if (existingSkill) {
      throw new ConflictException(
        'Kỹ năng này đã tồn tại trong tin tuyển dụng',
      );
    }

    const jobSkill = new JobSkill();
    jobSkill.jobId = dto.jobId;
    jobSkill.name = dto.name;
    jobSkill.experienceStart = dto.experienceStart;
    jobSkill.experienceEnd = dto.experienceEnd;

    this.setAuditForCreate(jobSkill);

    await this.jobSkillRepository.save(jobSkill);
    return ResponseHttp.success({
      message: 'Thêm kỹ năng thành công',
    });
  }

  /**
   * Lấy danh sách kỹ năng yêu cầu của tin tuyển dụng theo Job ID.
   */
  async findByJobId(jobId: number): Promise<ResponseHttp<JobSkillResponse[]>> {
    const skills = await this.jobSkillRepository.find({
      where: { jobId },
      order: { name: 'ASC' },
    });
    return ResponseHttp.success({
      message: 'Lấy danh sách kỹ năng thành công',
      data: skills.map((entity) => this.toResponse(entity)),
    });
  }

  /**
   * Lấy thông tin chi tiết một kỹ năng của tin tuyển dụng theo ID.
   */
  async findOne(id: number): Promise<ResponseHttp<JobSkillResponse>> {
    const jobSkill = await this.jobSkillRepository.findOne({
      where: { id },
    });
    if (!jobSkill) {
      throw new NotFoundException('Không tìm thấy liên kết kỹ năng này');
    }
    return ResponseHttp.success({
      message: 'Lấy thông tin chi tiết kỹ năng thành công',
      data: this.toResponse(jobSkill),
    });
  }

  /**
   * Cập nhật thông tin kỹ năng của tin tuyển dụng.
   */
  async update(id: number, dto: UpdateJobSkillDto): Promise<ResponseHttp<void>> {
    const jobSkill = await this.jobSkillRepository.findOne({
      where: { id },
    });
    if (!jobSkill) {
      throw new NotFoundException('Không tìm thấy liên kết kỹ năng này');
    }

    if (dto.jobId !== undefined) {
      const jobResponse = await this.jobsService.findOne(dto.jobId);
      const job = jobResponse.data;
      if (!job) {
        throw new NotFoundException('Không tìm thấy tin tuyển dụng');
      }
      jobSkill.jobId = dto.jobId;
    }

    if (dto.name !== undefined) {
      jobSkill.name = dto.name;
    }

    if (dto.experienceStart !== undefined) {
      jobSkill.experienceStart = dto.experienceStart;
    }

    if (dto.experienceEnd !== undefined) {
      jobSkill.experienceEnd = dto.experienceEnd;
    }

    // Xác thực khoảng kinh nghiệm sau khi cập nhật
    if (
      jobSkill.experienceStart !== undefined &&
      jobSkill.experienceEnd !== undefined
    ) {
      if (jobSkill.experienceStart > jobSkill.experienceEnd) {
        throw new BadRequestException(
          'Kinh nghiệm bắt đầu không được lớn hơn kinh nghiệm kết thúc',
        );
      }
    }

    // Kiểm tra trùng lặp sau khi thay đổi tên hoặc jobId
    if (dto.name !== undefined || dto.jobId !== undefined) {
      const jobId = jobSkill.jobId;
      const name = jobSkill.name;
      const existingSkill = await this.jobSkillRepository.findOne({
        where: { jobId, name },
      });
      if (existingSkill && existingSkill.id !== id) {
        throw new ConflictException(
          'Kỹ năng này đã tồn tại trong tin tuyển dụng',
        );
      }
    }

    this.setAuditForUpdate(jobSkill);

    await this.jobSkillRepository.save(jobSkill);
    return ResponseHttp.success({
      message: 'Cập nhật kỹ năng thành công',
    });
  }

  /**
   * Xóa một kỹ năng khỏi tin tuyển dụng.
   */
  async remove(id: number): Promise<ResponseHttp<void>> {
    const jobSkill = await this.jobSkillRepository.findOne({
      where: { id },
    });
    if (!jobSkill) {
      throw new NotFoundException('Không tìm thấy liên kết kỹ năng này');
    }
    await this.jobSkillRepository.remove(jobSkill);
    return ResponseHttp.success({
      message: 'Xóa kỹ năng thành công',
    });
  }
}
