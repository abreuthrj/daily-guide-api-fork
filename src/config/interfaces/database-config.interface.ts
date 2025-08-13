import { DataSourceOptions } from 'typeorm';

export interface DatabaseConfig {
  host: string;
  name: string;
  user: string;
  password: string;
  database: DataSourceOptions['type'];
}
