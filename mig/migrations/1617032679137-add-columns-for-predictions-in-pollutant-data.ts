import { MigrationInterface, QueryRunner, TableCheck } from 'typeorm';
import { createUniqueIndex, dropUniqueIndex } from '../lib';

const checkConstraint = new TableCheck({
  columnNames: ['is_prediction', 'prediction_datetime'],
  expression:
    'is_prediction AND prediction_datetime IS NOT NULL OR NOT is_prediction AND prediction_datetime IS NULL',
  name: 'check_pollutant_data_is_prediction_prediction_datetime',
});

export class AddColumnsForPredictionsInPollutantData1617032679137 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE pollutant_data ADD COLUMN is_prediction bool DEFAULT FALSE NOT NULL;
ALTER TABLE pollutant_data ADD COLUMN prediction_datetime timestamptz DEFAULT NULL;
`);
    await queryRunner.createCheckConstraint('pollutant_data', checkConstraint);
    await dropUniqueIndex(queryRunner, 'pollutant_data', [
      'station_id',
      'pollutant_id',
      'datetime',
    ]);
    return createUniqueIndex(queryRunner, 'pollutant_data', [
      'station_id',
      'pollutant_id',
      'datetime',
      'prediction_datetime',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropUniqueIndex(queryRunner, 'pollutant_data', [
      'station_id',
      'pollutant_id',
      'datetime',
      'prediction_datetime',
    ]);
    await createUniqueIndex(queryRunner, 'pollutant_data', [
      'station_id',
      'pollutant_id',
      'datetime',
    ]);
    await queryRunner.dropCheckConstraint('pollutant_data', checkConstraint);
    await queryRunner.dropColumn('pollutant_data', 'is_prediction');
    return queryRunner.dropColumn('pollutant_data', 'prediction_datetime');
  }
}
