import { AstroModule } from '#/astro/astro.module';
import { DynamoDBModule } from '#/aws/dynamodb/dynamodb.module';
import { OpenaiModule } from '#/openai/openai.module';
import { PurchaseModule } from '#/purchase/purchase.module';
import { UserModule } from '#/user/user.module';
import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';

@Module({
  imports: [
    OpenaiModule,
    UserModule,
    PurchaseModule,
    AstroModule,
    DynamoDBModule,
  ],
  controllers: [StoryController],
  providers: [StoryService],
  exports: [StoryService],
})
export class StoryModule {}
