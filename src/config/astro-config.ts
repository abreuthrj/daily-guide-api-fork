import { registerAs } from '@nestjs/config';

export default registerAs('astro', () => ({
  user_id: process.env.ASTRO_USER_ID,
  api_key: process.env.ASTRO_API_KEY,
}));
