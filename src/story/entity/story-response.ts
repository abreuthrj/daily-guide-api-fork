import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Feedback } from './feedback.entity';

export class StoryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  params?: any;

  @ApiProperty()
  canReload: boolean;

  @ApiProperty()
  feedback: Feedback;
}
