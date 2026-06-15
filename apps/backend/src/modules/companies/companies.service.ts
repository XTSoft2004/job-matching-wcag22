import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@/common/services/base-services';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ResponseHttp } from '@/common/utils/response.util';
import { BasePaginateQuery } from '@/common/dto/base-paginate-query.dto';
import { CompanyResponse, CompanyPaginatedResponse } from './response/companies.response';

@Injectable()
export class CompaniesService extends BaseService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @Inject(REQUEST)
    protected readonly req: Request & { user?: JWTInfoResponse },
  ) {
    super(req);
  }

  private toResponse(entity: Company): CompanyResponse {
    return plainToInstance(CompanyResponse, entity, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateCompanyDto): Promise<ResponseHttp<void>> {
    const company = this.companyRepository.create(dto);
    this.setAuditForCreate(company);
    await this.companyRepository.save(company);
    return ResponseHttp.success({
      message: 'Tạo công ty mới thành công',
    });
  }

  async findAll(
    query: BasePaginateQuery,
  ): Promise<CompanyPaginatedResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search || '';

    const queryBuilder = this.companyRepository.createQueryBuilder('company');

    if (search) {
      queryBuilder.where(
        'company.name LIKE :search OR company.address LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('company.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const companyResponses = data.map((entity) => this.toResponse(entity));

    return ResponseHttp.success({
      message: 'Lấy danh sách công ty thành công',
      data: companyResponses,
      meta: {
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async findOne(id: number): Promise<ResponseHttp<CompanyResponse>> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: { users: true },
    });
    if (!company) {
      throw new NotFoundException('Không tìm thấy thông tin công ty');
    }
    return ResponseHttp.success({
      message: 'Lấy thông tin chi tiết công ty thành công',
      data: this.toResponse(company),
    });
  }

  async update(id: number, dto: UpdateCompanyDto): Promise<ResponseHttp<void>> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Không tìm thấy thông tin công ty');
    }

    if (dto.name !== undefined) company.name = dto.name;
    if (dto.logo !== undefined) company.logo = dto.logo;
    if (dto.website !== undefined) company.website = dto.website;
    if (dto.address !== undefined) company.address = dto.address;
    if (dto.description !== undefined) company.description = dto.description;
    if (dto.companySize !== undefined) company.companySize = dto.companySize;

    this.setAuditForUpdate(company);
    await this.companyRepository.save(company);
    return ResponseHttp.success({
      message: 'Cập nhật thông tin công ty thành công',
    });
  }

  async remove(id: number): Promise<ResponseHttp<void>> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Không tìm thấy thông tin công ty');
    }
    await this.companyRepository.softRemove(company);
    return ResponseHttp.success({
      message: 'Xóa công ty thành công',
    });
  }
}
