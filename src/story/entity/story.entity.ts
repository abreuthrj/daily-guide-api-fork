import { User } from '#/user/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feedback } from './feedback.entity';

@Entity()
export class Story extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  metadata: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column()
  storyCategoryId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  user: User;

  @OneToOne(() => Feedback, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  feedback: Feedback;
}
