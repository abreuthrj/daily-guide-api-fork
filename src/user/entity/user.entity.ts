import { Planet } from '#/astro/interfaces/horoscope.interface';
import { Purchase } from '#/purchase/entity/purchase.entity';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAttribute } from './user-attribute.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column()
  password: string;

  /** FIREBASE USER COLUMNS */
  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  @Exclude({ toPlainOnly: true })
  isAnonymous: boolean;

  @Column({ nullable: true })
  photoURL: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  providerId: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  firebaseUUID: string;

  @Column({ default: 0 })
  @Exclude({ toPlainOnly: true })
  utcOffset: number;

  /** OTHER USER INFO */
  @Column('timestamp', { nullable: true })
  birthdate: Date;

  @Column({ nullable: true })
  notificationTime: string;

  @Column({ nullable: true })
  gender: GenderEnum;

  @Column({ nullable: true })
  address: string;

  @Column({ default: 'pt-BR' })
  language: string;

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @Column({ nullable: true })
  placeId: string;

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases: Purchase[];

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  nextRetrieve: Date;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  fcmToken: string;

  @Column('json', { nullable: true })
  @Exclude({ toPlainOnly: true })
  planets: Planet[];

  @OneToMany(() => UserAttribute, (userAttribute) => userAttribute.user)
  attributes: UserAttribute[];

  subscribed?: boolean;

  token?: string;

  refreshToken?: string;
}

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non-binary',
  OTHER = 'other',
}
