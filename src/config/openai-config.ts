import { registerAs } from '@nestjs/config';

export default registerAs('openai', () => ({
  secret_key: process.env.OPENAI_API_KEY,
}));
