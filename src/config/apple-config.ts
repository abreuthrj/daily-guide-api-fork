import { registerAs } from '@nestjs/config';

export default registerAs('apple', () => ({
  url: process.env.APPLE_API_URL,
  keyId: process.env.APPLE_KEY_ID,
  issuerId: process.env.APPLE_ISSUER_ID,
  audience: process.env.APPLE_AUDIENCE,
}));
