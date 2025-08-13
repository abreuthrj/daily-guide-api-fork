import { registerAs } from '@nestjs/config';

export default registerAs('secret', () => ({
  jwt: process.env.JWT_SECRET,
}));
