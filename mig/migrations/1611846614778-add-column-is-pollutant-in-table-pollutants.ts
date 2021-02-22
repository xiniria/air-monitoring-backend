import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnIsPollutantInTablePollutants1611846614778 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // for some reason queryRunner.addColumn does not work on the CI
    return queryRunner.query(`ALTER TABLE pollutants
        ADD COLUMN is_pollutant bool DEFAULT TRUE NOT NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.dropColumn('pollutants', 'is_pollutant');
  }
}
