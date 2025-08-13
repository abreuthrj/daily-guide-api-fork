import { AstroModule } from '#/astro/astro.module';
import { AuthModule } from '#/auth/auth.module';
import { GoogleModule } from '#/google/google.module';
import { OpenaiModule } from '#/openai/openai.module';
import { PurchaseModule } from '#/purchase/purchase.module';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    AuthModule,
    AstroModule,
    OpenaiModule,
    GoogleModule,
    PurchaseModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
