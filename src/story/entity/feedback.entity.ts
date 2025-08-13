import { User } from '#/user/entity/user.entity';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Feedback extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  description: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn()
  user: User;
}

export enum FeedbackTypeEnum {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}
