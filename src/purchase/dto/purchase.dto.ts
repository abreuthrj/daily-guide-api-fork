import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PurchaseDto {
  @ApiProperty()
  @IsString()
  transactionReceipt: string;

  @ApiProperty()
  @IsString()
  transactionId: string;

  @ApiProperty()
  @IsString()
  productId: string;
}
