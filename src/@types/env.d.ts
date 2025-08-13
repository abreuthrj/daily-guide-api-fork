declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;

      APP_NAME: string;
      APP_VERSION: string;
      APP_PORT: number;

      APP_MOBILE_VERSION: string;

      ASTRO_USER_ID: string;
      ASTRO_API_KEY: string;

      DB_HOST: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_TYPE: DataSourceOptions['type'];

      JWT_SECRET: string;

      OPENAI_API_KEY: string;

      GOOGLE_PLACES_API_KEY: string;

      NODE_TYPE: 'slave' | 'notification';

      CRYPTO_SECRET: string;
      CRYPTO_ALGORITHM: string;

      AWS_REGION: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_ACCESS_KEY: string;

      APPLE_API_URL: string;
      APPLE_KEY_ID: string;
      APPLE_ISSUER_ID: string;
      APPLE_AUDIENCE: string;
    }
  }
}

export {};
