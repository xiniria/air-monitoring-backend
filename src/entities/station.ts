import { Column, Entity } from 'typeorm';
import { Table } from './helpers/table';
import { ColumnNumericTransformer } from './helpers/numeric-transformer';

const transformer = new ColumnNumericTransformer();

@Entity({ name: 'stations' })
export class Station extends Table {
  @Column()
  name: string;

  @Column({ transformer })
  latitude: number;

  @Column({ transformer })
  longitude: number;

  @Column({ name: 'external_id' })
  externalId: number;
}
