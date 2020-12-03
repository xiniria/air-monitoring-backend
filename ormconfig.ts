import { ConnectionOptions } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';
import { CustomNamingStrategy } from './migration/naming-strategy';

config();

export default {
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT, 10) || 5432,
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'air_monitoring',
  migrations: [join(__dirname, 'migration/migrations', process.env.NODE_ENV === 'migration' ? '*.ts' : '*.js')],
  cli: {
    migrationsDir: 'migration/migrations',
  },
  namingStrategy: new CustomNamingStrategy(),
} as ConnectionOptions;
