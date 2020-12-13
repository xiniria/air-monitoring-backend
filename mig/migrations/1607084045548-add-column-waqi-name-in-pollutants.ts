import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnWaqiNameInPollutants1607084045548 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.addColumn('pollutants', {
      name: 'waqi_name',
      type: 'text',
      isNullable: true,
    } as TableColumn);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.dropColumn('pollutants', 'waqi_name');
  }
}
