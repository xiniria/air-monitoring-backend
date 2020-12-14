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

export async function createIndex(
  queryRunner: QueryRunner,
  table: Table | string,
  index: TableIndex,
) {
  const namingStrategy = new CustomNamingStrategy();
  const resolvedName =
    index.name || namingStrategy.indexName(table, index.columnNames, index.where);
  if (!resolvedName.startsWith('idx_')) {
    throw new Error('An index name should start with "idx_".');
  }

  return queryRunner.createIndex(table, index);
}

export async function createUniqueIndex(
  queryRunner: QueryRunner,
  tableName: string,
  columnNames: string[],
  name?: string,
  where?: string,
) {
  const whereDeleted = where ? `(${where}) AND deleted_at IS NOT NULL` : 'deleted_at IS NOT NULL';
  const whereUndeleted = where ? `(${where}) AND deleted_at IS NULL` : 'deleted_at IS NULL';

  const columnNamesNoDeletedAt = columnNames.filter((columnName) => columnName !== 'deleted_at');
  const columnNamesDeletedAt = [...columnNamesNoDeletedAt, 'deleted_at'];

  let resolvedNameDeleted;
  let resolvedNameUndeleted;

  if (name) {
    if (!name.endsWith('_undeleted_unique') && !name.endsWith('_deleted_unique')) {
      throw new Error(`A unique index name should either end with "_undeleted_unique" or with "_deleted_unique".
If the index you want to create is not a unique index, please use QueryRunner's method createIndex instead.`);
    }
    if (name.endsWith('_undeleted_unique')) {
      resolvedNameUndeleted = name;
      resolvedNameDeleted = name.replace('_undeleted_unique', '_deleted_unique');
    } else {
      resolvedNameDeleted = name;
      resolvedNameUndeleted = name.replace('_deleted_unique', '_undeleted_unique');
    }
  } else {
    const namingStrategy = new CustomNamingStrategy();
    resolvedNameDeleted = namingStrategy.indexName(tableName, columnNamesDeletedAt, whereDeleted);
    resolvedNameUndeleted = namingStrategy.indexName(
      tableName,
      columnNamesNoDeletedAt,
      whereUndeleted,
    );
  }

  await createIndex(
    queryRunner,
    tableName,
    new TableIndex({
      name: resolvedNameUndeleted,
      isUnique: true,
      columnNames: columnNamesNoDeletedAt.sort(),
      where: whereUndeleted,
    }),
  );
  return createIndex(
    queryRunner,
    tableName,
    new TableIndex({
      name: resolvedNameDeleted,
      isUnique: true,
      columnNames: columnNamesDeletedAt.sort(),
      where: whereDeleted,
    }),
  );
}

export async function dropUniqueIndex(
  queryRunner: QueryRunner,
  tableName: string,
  columnNames?: string[],
  indexName?: string,
) {
  if (!indexName && !columnNames) {
    throw new Error('You must specify either the index name or the names of the columns.');
  }

  let resolvedNameDeleted;
  let resolvedNameUndeleted;

  if (indexName) {
    if (indexName.endsWith('_deleted_unique')) {
      resolvedNameDeleted = indexName;
      resolvedNameUndeleted = indexName.replace('_deleted_unique', '_undeleted_unique');
    } else if (indexName.endsWith('_undeleted_unique')) {
      resolvedNameUndeleted = indexName;
      resolvedNameDeleted = indexName.replace('_undeleted_unique', '_deleted_unique');
    } else {
      throw new Error(`A unique index name should either end with "_undeleted_unique" or with "_deleted_unique".
If the index you want to drop is not a unique index, please use QueryRunner's method dropIndex instead.`);
    }
  } else {
    const columnNamesNoDeletedAt = columnNames.filter((columnName) => columnName !== 'deleted_at');
    const columnNamesDeletedAt = [...columnNamesNoDeletedAt, 'deleted_at'];

    const namingStrategy = new CustomNamingStrategy();
    resolvedNameUndeleted = namingStrategy.indexName(
      tableName,
      columnNamesDeletedAt,
      'deleted_at IS NOT NULL',
    );
    resolvedNameDeleted = namingStrategy.indexName(
      tableName,
      columnNamesNoDeletedAt,
      'deleted_at IS NULL',
    );
  }

  await queryRunner.dropIndex(tableName, resolvedNameUndeleted);
  return queryRunner.dropIndex(tableName, resolvedNameDeleted);
}
