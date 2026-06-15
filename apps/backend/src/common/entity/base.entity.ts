import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class EntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
    default: 'system',
  })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({
    name: 'modified_by',
    type: 'varchar',
    length: 100,
    default: 'system',
  })
  modifiedBy: string;

  @UpdateDateColumn({ name: 'modified_at', type: 'timestamp' })
  modifiedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
