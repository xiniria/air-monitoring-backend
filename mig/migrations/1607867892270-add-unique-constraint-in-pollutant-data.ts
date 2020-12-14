import { MigrationInterface, QueryRunner } from 'typeorm';
import { createUniqueIndex, dropUniqueIndex } from '../lib';

export class AddUniqueConstraintInPollutantData1607867892270 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return createUniqueIndex(queryRunner, 'pollutant_data', [
      'station_id',
      'pollutant_id',
      'datetime',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return dropUniqueIndex(queryRunner, 'pollutant_data', [
      'station_id',
      'pollutant_id',
      'datetime',
    ]);
  }
}
