import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class HoroscopeDto {
  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty()
  @IsString()
  localOfBirth: string;

  @ApiProperty()
  @IsString()
  fullName: string;
}
