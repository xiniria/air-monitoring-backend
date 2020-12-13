import { ConnectionOptions } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';
import { CustomNamingStrategy } from './mig/naming-strategy';

if (process.env.NODE_ENV !== 'production') config();

const commandPath = process.argv[0];
const command = commandPath.slice(commandPath.lastIndexOf('/') + 1);

if (command === 'ts-node') process.env.IS_TS_NODE = 'true';

export default {
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT, 10) || 5432,
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'air_monitoring',
  entities: [
    join(__dirname, 'src/entities', process.env.IS_TS_NODE ? '*.ts' : '*.js'),
  ],
  migrations: [
    join(__dirname, 'mig/migrations', process.env.IS_TS_NODE ? '*.ts' : '*.js'),
  ],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'mig/migrations',
  },
  namingStrategy: new CustomNamingStrategy(),
  synchronize: false,
} as ConnectionOptions;
