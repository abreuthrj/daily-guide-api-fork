import { registerAs } from '@nestjs/config';

export default registerAs('crypto', () => ({
  secret: process.env.CRYPTO_SECRET,
  algorithm: process.env.CRYPTO_ALGORITHM,
}));
