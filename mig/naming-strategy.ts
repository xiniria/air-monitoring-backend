import { DefaultNamingStrategy, Table, NamingStrategyInterface } from 'typeorm';

export class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return `idx_pk_${tableName}_${columnNames.join('_')}`;
  }

  foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    referencedTablePath?: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    referencedColumnNames?: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
  ): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;

    const fromNames = [tableName, ...columnNames];

    return ['fk', ...fromNames].filter((str: string) => !!str).join('_');
  }
}
