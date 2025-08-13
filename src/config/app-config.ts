import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.APP_PORT,
  name: process.env.APP_NAME,
  version: process.env.APP_VERSION,
}));
