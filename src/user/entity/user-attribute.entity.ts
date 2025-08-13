import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserAttribute extends BaseEntity {
  @PrimaryColumn({ generated: 'uuid' })
  id: string;

  @Column()
  title: string;

  @Column()
  value: string;

  @Column()
  slug: string;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Exclude()
  @ManyToOne(() => User)
  user: User;
}

export enum AttributeSlugsEnum {
  PERSONALITY = 'personality',
  ASCENDANT = 'ascendant',
  MOON = 'moon',
}
