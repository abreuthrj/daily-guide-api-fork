import { User } from '#/user/entity/user.entity';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Purchase extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  productId: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  transactionReceipt: string;

  @Column({ type: 'timestamptz' })
  transactionDate: Date;

  @Exclude({ toPlainOnly: true })
  @Column()
  transactionId: string;

  @Column({
    type: 'timestamptz',
    default: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })
  expiresAt: Date;

  @ManyToOne(() => User)
  user: User;
}

export enum ProductIdsEnum {
  SUBSCRIPTION_1_HOURS = 'subscription_1_hours',
  SUBSCRIPTION_30_DAYS = 'subscription_30_days',
}
