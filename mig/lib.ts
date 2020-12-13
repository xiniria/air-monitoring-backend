import { TableColumnOptions } from 'typeorm/schema-builder/options/TableColumnOptions';
import { TableForeignKeyOptions } from 'typeorm/schema-builder/options/TableForeignKeyOptions';
import { QueryRunner, Table, TableIndex } from 'typeorm';
import { CustomNamingStrategy } from './naming-strategy';

function getDefaultFields(): TableColumnOptions[] {
  return [
    {
      name: 'id',
      type: 'int',
      isPrimary: true,
      isNullable: false,
      isGenerated: true,
      generationStrategy: 'increment',
    },
    {
      name: 'created_at',
      type: 'timestamptz',
      isNullable: false,
      default: 'now()',
    },
    {
      name: 'updated_at',
      type: 'timestamptz',
      isNullable: false,
      default: 'now()',
    },
    {
      name: 'deleted_at',
      type: 'timestamptz',
      isNullable: true,
      default: null,
    },
  ];
}

export const FOREIGN_KEY_ACTIONS = {
  NO_ACTION: 'NO ACTION',
  RESTRICT: 'RESTRICT',
  CASCADE: 'CASCADE',
  SET_NULL: 'SET NULL',
  SET_DEFAULT: 'SET DEFAULT',
};

export async function createTable(
  queryRunner: QueryRunner,
  tableName: string,
  columns: TableColumnOptions[],
  foreignKeys?: TableForeignKeyOptions[],
): Promise<void> {
  const table = new Table({
    name: tableName,
    columns: [...getDefaultFields(), ...columns],
    foreignKeys,
  });
  await queryRunner.createTable(table, false, true, true);

  if (foreignKeys) {
    const customNamingStrategy = new CustomNamingStrategy();
    // create an index on each foreign key column to improve SQL joins
    await Promise.all(
      foreignKeys.map((fk) => {
        const foreignKeyName = customNamingStrategy.foreignKeyName(table, fk.columnNames);
        return queryRunner.createIndex(table, {
          name: `idx_${foreignKeyName}`,
          columnNames: fk.columnNames,
          isUnique: false,
        } as TableIndex);
      }),
    );
  }
}

export async function dropTable(queryRunner: QueryRunner, tableName: string): Promise<void> {
  return queryRunner.dropTable(tableName, false, true, true);
}
