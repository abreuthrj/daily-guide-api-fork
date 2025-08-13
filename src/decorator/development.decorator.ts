import { SetMetadata } from '@nestjs/common';

export const IS_DEVELOPMENT_KEY = 'isDevelopment';
export const Development = () => SetMetadata(IS_DEVELOPMENT_KEY, true);
