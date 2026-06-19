import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import { JobResponse, JobPaginatedResponse } from './response/jobs.response';

@Injectable()
export class JobsService extends BaseService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: Job): JobResponse {
    return plainToInstance(JobResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now()
    );
  }

  async create(dto: CreateJobDto): Promise<ResponseHttp<void>> {
    const job = new Job();
    job.employerId = dto.employerId;
    job.companyId = dto.companyId;
    job.title = dto.title;
    job.slug = dto.title.toLowerCase().replace(/ /g, '-');
    job.description = dto.description;
    job.requirements = dto.requirements;
    job.benefits = dto.benefits;
    job.industry = dto.industry;
    job.jobType = dto.jobType;
    job.experienceLevel = dto.experienceLevel;
    job.quantity = dto.quantity ?? 1;
    job.salaryMin = dto.salaryMin;
    job.salaryMax = dto.salaryMax;
    job.isSalaryNegotiable = dto.isSalaryNegotiable ?? false;
    job.workAddress = dto.workAddress;
    job.province = dto.province;

    this.setAuditForCreate(job);
    await this.jobRepository.save(job);

    // Call AI Tools to embed the job asynchronously
    try {
      this.jobRepository.findOne({
        where: { id: job.id },
        relations: { company: true },
      }).then((savedJob) => {
        if (!savedJob) return;
        
        const payload = {
          id: savedJob.id,
          title: savedJob.title,
          description: savedJob.description,
          requirements: savedJob.requirements,
          benefits: savedJob.benefits,
          industry: savedJob.industry,
          jobType: savedJob.jobType,
          experienceLevel: savedJob.experienceLevel,
          salaryMin: savedJob.salaryMin,
          salaryMax: savedJob.salaryMax,
          workAddress: savedJob.workAddress,
          province: savedJob.province,
          companyId: savedJob.companyId,
          employerId: savedJob.employerId,
          companyName: savedJob.company?.name || null
        };

        const aiToolsUrl = process.env.AI_TOOLS_URL || 'http://localhost:8000/api/v1';
        fetch(`${aiToolsUrl}/jobs/embed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }).catch(err => console.error('Failed to call AI Tools embedding webhook:', err));
      }).catch(err => console.error('Error loading job company relation for embedding:', err));
    } catch (error) {
      console.error('Error triggering embedding:', error);
    }

    return ResponseHttp.success({
      message: 'Tạo tin tuyển dụng mới thành công',
    });
  }

  async findAll(
    query: BasePaginateQuery,
  ): Promise<JobPaginatedResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';
    const idsStr = query.ids || '';

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.skills', 'skills');

    if (query.employerId) {
      queryBuilder.andWhere('job.employerId = :employerId', { employerId: query.employerId });
    }

    if (idsStr) {
      const ids = idsStr
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      if (ids.length > 0) {
        queryBuilder.andWhere('job.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1 = 0');
      }
    }

    if (search) {
      queryBuilder.andWhere(
        '(job.title ILIKE :search OR job.description ILIKE :search OR company.name ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('job.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const jobResponses = data.map((entity) => this.toResponse(entity));

    return ResponseHttp.success({
      message: 'Lấy danh sách công việc thành công',
      data: jobResponses,
      meta: {
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async findOne(id: number): Promise<ResponseHttp<JobResponse>> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: {
        company: true,
        skills: true,
        employer: true,
      },
    });
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }
    return ResponseHttp.success({
      message: 'Lấy chi tiết tin tuyển dụng thành công',
      data: this.toResponse(job),
    });
  }

  async update(id: number, dto: UpdateJobDto): Promise<ResponseHttp<void>> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: { company: true, skills: true },
    });
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    if (dto.employerId !== undefined) job.employerId = dto.employerId;
    if (dto.companyId !== undefined) job.companyId = dto.companyId;
    if (dto.title !== undefined) {
      job.title = dto.title;
      job.slug = this.generateSlug(dto.title);
    }
    if (dto.description !== undefined) job.description = dto.description;
    if (dto.requirements !== undefined) job.requirements = dto.requirements;
    if (dto.benefits !== undefined) job.benefits = dto.benefits;
    if (dto.industry !== undefined) job.industry = dto.industry;
    if (dto.jobType !== undefined) job.jobType = dto.jobType;
    if (dto.experienceLevel !== undefined)
      job.experienceLevel = dto.experienceLevel;
    if (dto.quantity !== undefined) job.quantity = dto.quantity;
    if (dto.salaryMin !== undefined) job.salaryMin = dto.salaryMin;
    if (dto.salaryMax !== undefined) job.salaryMax = dto.salaryMax;
    if (dto.isSalaryNegotiable !== undefined)
      job.isSalaryNegotiable = dto.isSalaryNegotiable;
    if (dto.workAddress !== undefined) job.workAddress = dto.workAddress;
    if (dto.province !== undefined) job.province = dto.province;
    if (dto.status !== undefined) job.status = dto.status;

    this.setAuditForUpdate(job);
    await this.jobRepository.save(job);
    return ResponseHttp.success({
      message: 'Cập nhật tin tuyển dụng thành công',
    });
  }

  async remove(id: number): Promise<ResponseHttp<void>> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }
    await this.jobRepository.softRemove(job);
    return ResponseHttp.success({
      message: 'Xóa tin tuyển dụng thành công',
    });
  }
}
