import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { GenderEnum } from '../entity/user.entity';

export class UserDto {
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  dateOfBirth: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  placeId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notificationTime: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gender: GenderEnum;

  @ApiProperty()
  @IsString()
  @IsOptional()
  displayName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  photoURL: string;

  // @ApiProperty()
  // @IsString()
  // @IsOptional()
  // email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fcmToken: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  utcOffset: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  language: string;
}
