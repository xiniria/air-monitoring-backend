import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Table } from './helpers/table';
import { Station } from './station';
import { Pollutant } from './pollutant';
import { ColumnNumericTransformer } from './helpers/numeric-transformer';
import { ColumnTimestampTzTransformer } from './helpers/timestamptz-transformer';

const numericTransformer = new ColumnNumericTransformer();
const timestampTzTransformer = new ColumnTimestampTzTransformer();

@Entity({ name: 'pollutant_data' })
export class PollutantData extends Table {
  @Column({ transformer: timestampTzTransformer })
  datetime: string;

  @Column({ transformer: numericTransformer })
  value: number;

  @Column({ name: 'station_id' })
  stationId: number;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @Column({ name: 'pollutant_id' })
  pollutantId: number;

  @ManyToOne(() => Pollutant)
  @JoinColumn({ name: 'pollutant_id' })
  pollutant: Pollutant;

  @Column({ name: 'is_prediction', default: false })
  isPrediction: boolean;

  @Column({ name: 'prediction_datetime', transformer: timestampTzTransformer, default: null })
  predictionDatetime: string;
}
