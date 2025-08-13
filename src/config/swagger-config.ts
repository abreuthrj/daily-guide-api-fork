import { AppConfig } from '#/config/interfaces/app-config.interface';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, appConfig: AppConfig) {
  const config = new DocumentBuilder()
    .setTitle(appConfig.name)
    .setDescription(`${appConfig.name} API`)
    .setVersion(appConfig.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
}
