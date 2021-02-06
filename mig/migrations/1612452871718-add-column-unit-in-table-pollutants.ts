import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnUnitInTablePollutants1612452871718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.query(`ALTER TABLE pollutants
        ADD COLUMN unit text DEFAULT '' NOT NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.dropColumn('pollutants', 'unit');
  }
}
