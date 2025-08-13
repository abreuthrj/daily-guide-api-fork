import { DatabaseConfig } from '#/config/interfaces/database-config.interface';
import { registerAs } from '@nestjs/config';

export default registerAs<DatabaseConfig>('database', () => ({
  host: process.env.DB_HOST,
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_TYPE || 'postgres',
}));
