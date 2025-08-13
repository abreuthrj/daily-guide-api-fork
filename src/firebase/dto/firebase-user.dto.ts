import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class FirebaseUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  displayName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  photoURL: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isAnonymous: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  providerId: string;
}
