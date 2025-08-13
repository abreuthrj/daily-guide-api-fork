import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class StoryCategory {
  static readonly TableName = 'story-category';

  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  type: StoryCategoryTypeEnum;

  @ApiProperty()
  image: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  contentPrompt: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  template: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  order: number;
}

export enum StoryCategoryTypeEnum {
  TODAY = 'today',
  DOS = 'dos',
  DONTS = 'donts',
  LISTEN_READ_WATCH = 'listen_read_watch',
}
