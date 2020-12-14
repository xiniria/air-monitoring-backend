import { DefaultNamingStrategy, Table, NamingStrategyInterface } from 'typeorm';

const customReduce = (columnName: string): string => {
  switch (columnName) {
    case 'id':
      return 'id';
    case 'datetime':
      return 'dt';
    default:
      return columnName.charAt(0);
  }
};

const reduceColumnName = (columnName: string): string => {
  if (!columnName.includes('_')) return customReduce(columnName);
  else return columnName.split('_').map(customReduce).join('');
};

const checkIdentifierNameLength = (name: string): string => {
  if (name.length > 63) {
    throw new Error(
      'Automatically generated name is longer than Postgres-authorized 63 characters. Please provide a custom name instead.',
    );
  }
  return name;
};

export class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return checkIdentifierNameLength(`idx_pk_${tableName}_${columnNames.join('_')}`);
  }

  foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    referencedTablePath?: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    referencedColumnNames?: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
  ): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;

    const fromNames = [tableName, ...columnNames];

    return checkIdentifierNameLength(['fk', ...fromNames].filter((str: string) => !!str).join('_'));
  }

  uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    const hasDeletedAt = columnNames.includes('deleted_at');
    const columnNamesNoDeletedAt = columnNames.filter((columnName) => columnName !== 'deleted_at');
    // sort column names for uniqueness of the name
    const columns = columnNamesNoDeletedAt.sort().map(reduceColumnName).join('_');

    return checkIdentifierNameLength(
      `${tableName}_${columns}_${hasDeletedAt ? 'deleted' : 'undeleted'}_unique`,
    );
  }

  indexName(tableOrName: Table | string, columnNames: string[], where?: string): string {
    if (columnNames.includes('deleted_at') && where.includes('deleted_at IS NOT NULL')) {
      // unique constraint on soft-deleted rows
      return checkIdentifierNameLength(
        `idx_${this.uniqueConstraintName(tableOrName, columnNames)}`,
      );
    } else if (!columnNames.includes('deleted_at') && where.includes('deleted_at IS NULL')) {
      // unique constraint on undeleted rows
      return checkIdentifierNameLength(
        `idx_${this.uniqueConstraintName(tableOrName, columnNames)}`,
      );
    } else return checkIdentifierNameLength(super.indexName(tableOrName, columnNames, where));
  }
}
