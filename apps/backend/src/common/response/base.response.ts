import { Exclude, Expose } from 'class-transformer';

/**
 * Base response DTO that all module-level Response classes extend.
 * Uses @Exclude() at class level so only @Expose()-decorated fields are serialized.
 * Hides internal audit fields: deletedAt, createdBy, modifiedBy.
 */
@Exclude()
export class BaseResponse {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  modifiedAt: Date;
}
