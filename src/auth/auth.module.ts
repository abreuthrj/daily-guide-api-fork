import { DynamoDBModule } from '#/aws/dynamodb/dynamodb.module';
import { SecretConfig } from '#/config/interfaces/secret-config.interface';
import secretConfig from '#/config/secret-config';
import { FirebaseModule } from '#/firebase/firebase.module';
import { PurchaseModule } from '#/purchase/purchase.module';
import { User } from '#/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (secretConfig: SecretConfig) => ({
        secret: secretConfig.jwt,
        signOptions: { expiresIn: '1d', algorithm: 'HS256' },
      }),
      inject: [secretConfig.KEY],
    }),
    DynamoDBModule,
    PurchaseModule,
    FirebaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
