import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  key: process.env.GOOGLE_PLACES_API_KEY,
  service_account_token: process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN,
}));
