import { Connection, EntityMetadata } from 'typeorm';

export async function truncateTables(connection: Connection) {
  const tableNames = connection.entityMetadatas
    .map((entityMetadata: EntityMetadata) => entityMetadata.tableName)
    .map((tableName: string) => `"${tableName}"`)
    .join(', ');

  const query = `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`;
  await connection.query(query);
}
