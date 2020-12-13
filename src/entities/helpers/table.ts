import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnTimestampTzTransformer } from './timestamptz-transformer';

const transformer = new ColumnTimestampTzTransformer();

export abstract class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', transformer })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', transformer })
  updatedAt: string;

  @DeleteDateColumn({ name: 'deleted_at', transformer })
  deletedAt: string | null;
}
