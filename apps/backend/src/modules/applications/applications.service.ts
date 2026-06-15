import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { Application, ApplicationStatus } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import { ApplicationResponse, ApplicationPaginatedResponse } from './response/applications.response';
import { Job, JobStatus } from '@/modules/jobs/entities/job.entity';
import { User, UserRole } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';
import { CandidateProfilesService } from '@/modules/candidate/candidate_profiles/candidate-profiles.service';
import { CandidateCvsService } from '@/modules/candidate/candidate_cvs/candidate-cvs.service';

@Injectable()
export class ApplicationsService extends BaseService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly usersService: UsersService,
    private readonly candidateProfilesService: CandidateProfilesService,
    private readonly candidateCvsService: CandidateCvsService,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: Application): ApplicationResponse {
    return plainToInstance(ApplicationResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Ứng viên nộp đơn ứng tuyển cho một công việc.
   */
  async create(dto: CreateApplicationDto): Promise<ResponseHttp<void>> {
    const currentUser = this.jwtInfo;

    // 1. Chỉ ứng viên mới được nộp đơn (hoặc Admin)
    if (!currentUser || (currentUser.role !== UserRole.CANDIDATE && currentUser.role !== UserRole.ADMIN)) {
      throw new ForbiddenException('Chỉ ứng viên mới có thể nộp đơn ứng tuyển');
    }

    // 2. Lấy hồ sơ ứng viên theo profileId truyền lên
    const profileResponse = await this.candidateProfilesService.findOne(
      dto.profileId,
    );
    const profile = profileResponse.data;
    if (!profile) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ ứng viên',
      );
    }

    // Kiểm tra quyền sở hữu hồ sơ nếu là Ứng viên
    if (currentUser.role === UserRole.CANDIDATE && profile.userId !== currentUser.id) {
      throw new ForbiddenException('Bạn không có quyền nộp đơn thay hồ sơ ứng viên khác');
    }

    // 3. Kiểm tra tin tuyển dụng có tồn tại và đang mở hay không
    const job = await this.jobRepository.findOne({ where: { id: dto.jobId } });
    if (!job) {
      throw new NotFoundException('Tin tuyển dụng không tồn tại');
    }
    if (job.status !== JobStatus.ACTIVE) {
      throw new BadRequestException(
        'Tin tuyển dụng đã đóng hoặc tạm dừng nhận hồ sơ',
      );
    }

    // 4. Kiểm tra CV có hợp lệ và thuộc sở hữu của ứng viên hay không
    const cvResponse = await this.candidateCvsService.findOne(
      dto.candidateCvId,
    );
    const cv = cvResponse.data;
    if (!cv || cv.profileId !== profile.id) {
      throw new BadRequestException(
        'Tệp CV không hợp lệ hoặc không thuộc hồ sơ của bạn',
      );
    }

    // 5. Kiểm tra đơn ứng tuyển trùng lặp
    const existingApp = await this.applicationRepository.findOne({
      where: { jobId: dto.jobId, profileId: profile.id },
    });
    if (existingApp) {
      throw new ConflictException('Bạn đã nộp đơn ứng tuyển cho công việc này');
    }

    // 6. Tạo mới đơn ứng tuyển
    const application = new Application();
    application.jobId = dto.jobId;
    application.profileId = profile.id;
    application.candidateCvId = dto.candidateCvId;
    application.coverLetter = dto.coverLetter;
    application.status = ApplicationStatus.SUBMITTED;
    application.submittedAt = new Date();

    this.setAuditForCreate(application);
    await this.applicationRepository.save(application);

    // 7. Tăng số lượng nộp đơn của tin tuyển dụng
    await this.jobRepository.increment({ id: dto.jobId }, 'applicationCount', 1);

    return ResponseHttp.success({
      message: 'Nộp đơn ứng tuyển thành công',
    });
  }

  /**
   * Lấy danh sách đơn ứng tuyển có phân trang và bộ lọc.
   */
  async findAll(
    query: BasePaginateQuery & {
      jobId?: number;
      profileId?: number;
      status?: ApplicationStatus;
    },
  ): Promise<ApplicationPaginatedResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';
    const currentUser = this.jwtInfo;

    if (!currentUser) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('app.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('app.candidateCv', 'candidateCv');

    // Phân quyền dữ liệu theo vai trò người dùng
    if (currentUser.role === UserRole.CANDIDATE) {
      // Lấy hồ sơ của candidate hiện tại để lấy profileId
      const profileResponse = await this.candidateProfilesService.findByUserId(
        currentUser.id,
      );
      const profile = profileResponse.data;
      if (!profile) {
        queryBuilder.andWhere('app.profileId = -1');
      } else {
        queryBuilder.andWhere('app.profileId = :profileId', {
          profileId: profile.id,
        });
      }
    } else if (currentUser.role === UserRole.EMPLOYER) {
      // Nhà tuyển dụng chỉ xem đơn ứng tuyển của các công việc thuộc công ty họ
      const employerResponse = await this.usersService.findOne(currentUser.id);
      const companyId = employerResponse.data?.companyId;
      if (companyId) {
        queryBuilder.andWhere('job.companyId = :companyId', { companyId });
      } else {
        // Nếu NTD chưa liên kết công ty, chỉ xem tin họ tự đăng
        queryBuilder.andWhere('job.employerId = :employerId', {
          employerId: currentUser.id,
        });
      }
    }

    // Các bộ lọc bổ sung tùy chọn
    if (query.jobId) {
      queryBuilder.andWhere('app.jobId = :jobId', { jobId: query.jobId });
    }
    if (query.profileId) {
      queryBuilder.andWhere('app.profileId = :profileId', {
        profileId: query.profileId,
      });
    }
    if (query.status) {
      queryBuilder.andWhere('app.status = :status', { status: query.status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(job.title LIKE :search OR user.fullName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('app.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const applicationResponses = data.map((entity) => this.toResponse(entity));

    return ResponseHttp.success({
      message: 'Lấy danh sách đơn ứng tuyển thành công',
      data: applicationResponses,
      meta: {
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  /**
   * Lấy thông tin chi tiết một đơn ứng tuyển.
   */
  async findOne(id: number): Promise<ResponseHttp<ApplicationResponse>> {
    const currentUser = this.jwtInfo;
    if (!currentUser) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: {
        job: { company: true },
        profile: { user: true },
        candidateCv: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    // Kiểm tra quyền xem chi tiết đơn ứng tuyển
    if (currentUser.role === UserRole.CANDIDATE) {
      const profileResponse = await this.candidateProfilesService.findByUserId(
        currentUser.id,
      );
      const profile = profileResponse.data;
      if (!profile || application.profileId !== profile.id) {
        throw new ForbiddenException('Bạn không có quyền xem đơn ứng tuyển này');
      }
    } else if (currentUser.role === UserRole.EMPLOYER) {
      const employerResponse = await this.usersService.findOne(currentUser.id);
      const companyId = employerResponse.data?.companyId;
      if (companyId) {
        if (application.job.companyId !== companyId) {
          throw new ForbiddenException(
            'Bạn không có quyền xem đơn ứng tuyển của công ty khác',
          );
        }
      } else {
        if (application.job.employerId !== currentUser.id) {
          throw new ForbiddenException('Bạn không có quyền xem đơn ứng tuyển này');
        }
      }
    }

    return ResponseHttp.success({
      message: 'Lấy chi tiết đơn ứng tuyển thành công',
      data: this.toResponse(application),
    });
  }

  /**
   * Cập nhật trạng thái hoặc ghi chú đơn ứng tuyển (chỉ dành cho Nhà tuyển dụng / Admin).
   */
  async update(
    id: number,
    dto: UpdateApplicationDto,
  ): Promise<ResponseHttp<void>> {
    const currentUser = this.jwtInfo;
    if (!currentUser) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: { job: true, profile: true },
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    // Phân quyền cập nhật dựa trên vai trò
    if (currentUser.role === UserRole.CANDIDATE) {
      // Ứng viên không được cập nhật trạng thái tuyển dụng hoặc ghi chú nhà tuyển dụng
      if (dto.status !== undefined || dto.employerNote !== undefined) {
        throw new ForbiddenException(
          'Ứng viên không được cập nhật trạng thái hoặc ghi chú của nhà tuyển dụng',
        );
      }

      // Kiểm tra tính sở hữu đơn ứng tuyển
      if (application.profile.userId !== currentUser.id) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa đơn ứng tuyển này');
      }

      // Cập nhật profileId nếu có truyền lên
      if (dto.profileId !== undefined) {
        const profileResponse = await this.candidateProfilesService.findOne(dto.profileId);
        const profile = profileResponse.data;
        if (!profile) {
          throw new NotFoundException('Không tìm thấy hồ sơ ứng viên mới');
        }
        if (profile.userId !== currentUser.id) {
          throw new ForbiddenException('Bạn không thể gán đơn ứng tuyển vào hồ sơ của người khác');
        }
        application.profileId = dto.profileId;
      }

      // Cập nhật candidateCvId nếu có truyền lên
      if (dto.candidateCvId !== undefined) {
        const cvResponse = await this.candidateCvsService.findOne(dto.candidateCvId);
        const cv = cvResponse.data;
        if (!cv) {
          throw new NotFoundException('Không tìm thấy CV mới');
        }
        const targetProfileId = dto.profileId || application.profileId;
        if (cv.profileId !== targetProfileId) {
          throw new BadRequestException('Tệp CV không thuộc hồ sơ ứng tuyển này');
        }
        application.candidateCvId = dto.candidateCvId;
      }

      // Cập nhật coverLetter nếu có truyền lên
      if (dto.coverLetter !== undefined) {
        application.coverLetter = dto.coverLetter;
      }

    } else if (currentUser.role === UserRole.EMPLOYER) {
      // Nhà tuyển dụng không thể sửa đổi thông tin ứng tuyển của ứng viên
      if (
        dto.profileId !== undefined ||
        dto.candidateCvId !== undefined ||
        dto.coverLetter !== undefined
      ) {
        throw new ForbiddenException(
          'Nhà tuyển dụng không thể sửa hồ sơ, CV hoặc thư giới thiệu của ứng viên',
        );
      }

      // Kiểm tra quyền đối với Nhà tuyển dụng
      const employerResponse = await this.usersService.findOne(currentUser.id);
      const companyId = employerResponse.data?.companyId;
      if (companyId) {
        if (application.job.companyId !== companyId) {
          throw new ForbiddenException(
            'Bạn không có quyền cập nhật đơn ứng tuyển của công ty khác',
          );
        }
      } else {
        if (application.job.employerId !== currentUser.id) {
          throw new ForbiddenException(
            'Bạn không có quyền cập nhật đơn ứng tuyển này',
          );
        }
      }

      // Cập nhật trạng thái và ghi chú
      if (dto.status !== undefined) {
        if (
          application.status === ApplicationStatus.SUBMITTED &&
          dto.status !== ApplicationStatus.SUBMITTED
        ) {
          application.reviewedAt = new Date();
        }
        application.status = dto.status;
      }
      if (dto.employerNote !== undefined) {
        application.employerNote = dto.employerNote;
      }

    } else if (currentUser.role === UserRole.ADMIN) {
      // Admin có thể cập nhật mọi trường
      if (dto.profileId !== undefined) {
        const profileResponse = await this.candidateProfilesService.findOne(dto.profileId);
        if (!profileResponse.data) {
          throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
        }
        application.profileId = dto.profileId;
      }
      if (dto.candidateCvId !== undefined) {
        const cvResponse = await this.candidateCvsService.findOne(dto.candidateCvId);
        const cv = cvResponse.data;
        if (!cv) {
          throw new NotFoundException('Không tìm thấy CV');
        }
        const targetProfileId = dto.profileId || application.profileId;
        if (cv.profileId !== targetProfileId) {
          throw new BadRequestException('Tệp CV không thuộc hồ sơ ứng tuyển');
        }
        application.candidateCvId = dto.candidateCvId;
      }
      if (dto.coverLetter !== undefined) {
        application.coverLetter = dto.coverLetter;
      }
      if (dto.status !== undefined) {
        if (
          application.status === ApplicationStatus.SUBMITTED &&
          dto.status !== ApplicationStatus.SUBMITTED
        ) {
          application.reviewedAt = new Date();
        }
        application.status = dto.status;
      }
      if (dto.employerNote !== undefined) {
        application.employerNote = dto.employerNote;
      }
    }

    this.setAuditForUpdate(application);
    await this.applicationRepository.save(application);

    return ResponseHttp.success({
      message: 'Cập nhật đơn ứng tuyển thành công',
    });
  }

  /**
   * Ứng viên rút đơn ứng tuyển (Soft Delete).
   */
  async remove(id: number): Promise<ResponseHttp<void>> {
    const currentUser = this.jwtInfo;
    if (!currentUser) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    // Chỉ ứng viên sở hữu đơn (hoặc Admin) mới có quyền rút đơn
    if (currentUser.role === UserRole.CANDIDATE) {
      const profileResponse = await this.candidateProfilesService.findByUserId(
        currentUser.id,
      );
      const profile = profileResponse.data;
      if (!profile || application.profileId !== profile.id) {
        throw new ForbiddenException('Bạn không có quyền rút đơn ứng tuyển này');
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền rút đơn ứng tuyển này');
    }

    // Giảm số lượng nộp đơn của tin tuyển dụng
    await this.jobRepository.decrement({ id: application.jobId }, 'applicationCount', 1);

    // Xóa mềm đơn ứng tuyển
    await this.applicationRepository.softRemove(application);

    return ResponseHttp.success({
      message: 'Rút đơn ứng tuyển thành công',
    });
  }
}
