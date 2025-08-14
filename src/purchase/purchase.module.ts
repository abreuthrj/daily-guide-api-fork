import appleConfig from '#/config/apple-config';
import { AppleConfig } from '#/config/interfaces/apple-config.interface';
import { GoogleModule } from '#/google/google.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import { Purchase } from './entity/purchase.entity';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase]),
    GoogleModule,
    JwtModule.registerAsync({
      inject: [appleConfig.KEY],
      useFactory: (appleConfig: AppleConfig) => ({
        privateKey: fs.readFileSync('private/SubscriptionKey_7H8MXPBSZN.p8'),
        signOptions: {
          algorithm: 'ES256',
          keyid: appleConfig.keyId,
          issuer: appleConfig.issuerId,
          expiresIn: 120,
          audience: appleConfig.audience,
        },
      }),
    }),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
