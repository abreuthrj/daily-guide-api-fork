import { Module } from '@nestjs/common';
import { DynamoDBService } from './dynamodb.service';

@Module({
  imports: [],
  exports: [DynamoDBService],
  providers: [DynamoDBService],
})
export class DynamoDBModule {}
