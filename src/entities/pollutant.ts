import { Column, Entity } from 'typeorm';
import { Table } from './helpers/table';

@Entity({ name: 'pollutants' })
export class Pollutant extends Table {
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'short_name' })
  shortName: string;

  @Column()
  description: string;

  @Column({ name: 'waqi_name' })
  waqiName: string;
}
