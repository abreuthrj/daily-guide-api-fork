import { SubscriptionGuard } from '#/auth/guard/subscription.guard';
import appConfig from '#/config/app-config';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AstroModule } from './astro/astro.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guard/jwt.guard';
import { RoleGuard } from './auth/guard/role.guard';
import { DynamoDBModule } from './aws/dynamodb/dynamodb.module';
import appleConfig from './config/apple-config';
import astroConfig from './config/astro-config';
import awsConfig from './config/aws-config';
import databaseConfig from './config/database-config';
import googleConfig from './config/google-config';
import { DatabaseConfig } from './config/interfaces/database-config.interface';
import openaiConfig from './config/openai-config';
import secretConfig from './config/secret-config';
import { DatabaseModule } from './database/database.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { FirebaseModule } from './firebase/firebase.module';
import { UserGenerator } from './generator/user-generator.service';
import { GoogleModule } from './google/google.module';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ValidationInterceptor } from './interceptors/validation.interceptor';
import { BodyMiddleware } from './middlewares/body.middleware';
import { OpenaiModule } from './openai/openai.module';
import { PurchaseModule } from './purchase/purchase.module';
import { StoryModule } from './story/story.module';
import { NotificationTask } from './tasks/notification-task.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        astroConfig,
        databaseConfig,
        secretConfig,
        openaiConfig,
        googleConfig,
        awsConfig,
        appleConfig,
      ],
      envFilePath: ['.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: `${__dirname}/../public`,
    }),
    // LoggerModule.forRootAsync({
    //   useFactory: async () => {
    //     return {
    //       name: 'DAILY GUIDE',
    //       level: process.env.NODE_ENV === 'production' ? 'debug' : 'info',
    //       pinoHttp: {
    //         transport:
    //           process.env.NODE_ENV !== 'production'
    //             ? {
    //                 target: 'pino-pretty',
    //                 options: {
    //                   colorize: true,
    //                   levelFrist: true,
    //                   translateTime: 'UTC:mm/dd/yyyy, h:MM:ss TT Z',
    //                 },
    //               }
    //             : undefined,
    //       },
    //       exclude: [{ method: RequestMethod.ALL, path: 'api/health' }],
    //       forRoutes: ['*'],
    //     };
    //   },
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: (databaseConfig: DatabaseConfig) => ({
        type: 'postgres',
        host: databaseConfig.host,
        username: databaseConfig.user,
        password: databaseConfig.password,
        database: databaseConfig.name,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: process.env.NODE_ENV === 'local',
        // synchronize: true,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options);
        return dataSource.initialize();
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    AstroModule,
    OpenaiModule,
    GoogleModule,
    PurchaseModule,
    DatabaseModule,
    StoryModule,
    FirebaseModule,
    DynamoDBModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BodyMiddleware,
    UserModule,
    UserGenerator,
    NotificationTask,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ValidationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(BodyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
