import { MigrationInterface, QueryRunner } from 'typeorm';
import { createTable, dropTable, FOREIGN_KEY_ACTIONS } from '../lib';

export class SetupDb1606722308723 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTable(queryRunner, 'stations', [
      {
        name: 'name',
        type: 'text',
        isNullable: false,
      },
      {
        name: 'latitude',
        type: 'numeric',
        isNullable: false,
      },
      {
        name: 'longitude',
        type: 'numeric',
        isNullable: false,
      },
      {
        name: 'external_id',
        type: 'int',
        isNullable: false,
      },
    ]);

    await createTable(queryRunner, 'pollutants', [
      {
        name: 'full_name',
        type: 'text',
        isNullable: false,
      },
      {
        name: 'short_name',
        type: 'text',
        isNullable: false,
      },
      {
        name: 'description',
        type: 'text',
        isNullable: false,
      },
    ]);

    await createTable(
      queryRunner,
      'pollutant_data',
      [
        {
          name: 'station_id',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'pollutant_id',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'datetime',
          type: 'timestamptz',
          isNullable: false,
        },
        {
          name: 'value',
          type: 'numeric',
          isNullable: false,
        },
      ],
      [
        {
          columnNames: ['station_id'],
          referencedTableName: 'stations',
          referencedColumnNames: ['id'],
          onUpdate: FOREIGN_KEY_ACTIONS.CASCADE,
          onDelete: FOREIGN_KEY_ACTIONS.CASCADE,
        },
        {
          columnNames: ['pollutant_id'],
          referencedTableName: 'pollutants',
          referencedColumnNames: ['id'],
          onUpdate: FOREIGN_KEY_ACTIONS.CASCADE,
          onDelete: FOREIGN_KEY_ACTIONS.CASCADE,
        },
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTable(queryRunner, 'pollutant_data');
    await dropTable(queryRunner, 'pollutants');
    return dropTable(queryRunner, 'stations');
  }
}
