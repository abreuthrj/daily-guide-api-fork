import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { FeedbackTypeEnum } from '../entity/feedback.entity';

export class FeedbackDto {
  @ApiProperty()
  @IsIn(Object.values(FeedbackTypeEnum))
  type: FeedbackTypeEnum;

  @IsOptional()
  description: string;
}
