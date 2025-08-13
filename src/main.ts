import { AppConfig } from '#/config/interfaces/app-config.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as firebaseAdmin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger-config';
import { UnprocessibleEntityValidationPipe } from './pipes/unprocessible-entity-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useLogger(app.get(Logger));

  const firebaseApp = firebaseAdmin.initializeApp({
    credential: applicationDefault(),
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  app.useGlobalPipes(
    new UnprocessibleEntityValidationPipe({
      whitelist: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );
  app.setGlobalPrefix('api');
  app.use(bodyParser.text({ type: 'json' }));
  app.use(compression());

  setupSwagger(app, appConfig);

  await app.listen(appConfig.port);

  return appConfig.port;
}

bootstrap().then((port) => {
  console.log(`App listening to port: ${port}`);
});
