import { Request } from 'express';
import { JWTInfoResponse } from '@/modules/authenticator/tokens/response/jwt-info.response';
import { EntityBase } from '@/common/entity/base.entity';
import { Repository } from 'typeorm';

export class BaseService {
  constructor(
    protected readonly request: Request & { user?: JWTInfoResponse },
  ) {}

  get jwtInfo(): JWTInfoResponse | undefined {
    return this.request?.user;
  }

  protected setAuditForCreate(entity: EntityBase) {
    const username = this.jwtInfo?.username || 'system';
    entity.createdBy = username;
    entity.createdAt = new Date();
    entity.modifiedBy = username;
    entity.modifiedAt = new Date();
  }

  protected setAuditForUpdate(entity: EntityBase) {
    const username = this.jwtInfo?.username || 'system';
    entity.modifiedBy = username;
    entity.modifiedAt = new Date();
  }

  protected async generateCode<T extends EntityBase>(
    repository: Repository<T>,
    prefix: string,
  ): Promise<string> {
    const lastRecord = await repository
      .createQueryBuilder('entity')
      .withDeleted()
      .orderBy('entity.id', 'DESC')
      .getOne();

    const nextId = lastRecord ? lastRecord.id + 1 : 1;
    return `${prefix}${nextId}`;
  }
}
