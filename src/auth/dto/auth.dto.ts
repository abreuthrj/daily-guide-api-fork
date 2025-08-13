import { FirebaseUserDto } from '#/firebase/dto/firebase-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthDto extends FirebaseUserDto {
  @ApiProperty()
  @IsString()
  firebaseToken: string;
}
