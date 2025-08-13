import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { AuthUser } from '#/decorator/auth-user.decorator';
import { Development } from '#/decorator/development.decorator';
import { Public } from '#/decorator/public.decorator';
import { Result } from '#/entity/result.entity';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchaseDto } from './dto/purchase.dto';
import { Purchase } from './entity/purchase.entity';
import { PurchaseService } from './purchase.service';

@ApiTags('Purchase')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Development()
  @Public()
  @ApiResponse({
    type: Result,
    description: 'Get purchase status',
    status: 200,
  })
  @Get('jwt')
  async issue(): Promise<Result> {
    return await this.purchaseService.issue();
  }

  @ApiResponse({
    type: Result,
    description: 'Get purchase status',
    status: 200,
  })
  @Get('')
  async get(@AuthUser() userSession: UserSession): Promise<Purchase[]> {
    return await this.purchaseService.get(userSession);
  }

  @ApiResponse({
    type: Result,
    description: 'Purchase product from store',
    status: 200,
  })
  @Post('')
  async purchase(
    @AuthUser() userSession: UserSession,
    @Body() purchaseDto: PurchaseDto,
  ): Promise<Result> {
    return await this.purchaseService.purchase(userSession, purchaseDto);
  }

  @ApiResponse({
    type: Result,
    description: 'Recover purchase from store',
    status: 200,
  })
  @Post('recover')
  async recover(
    @AuthUser() userSession: UserSession,
    @Body() purchaseRecoverDto: PurchaseDto,
  ): Promise<Result> {
    return await this.purchaseService.recover(userSession, purchaseRecoverDto);
  }

  @Public()
  @ApiResponse({
    type: Result,
    description: 'Recover subscription ids',
    status: 200,
  })
  @Get('skus')
  async subscriptionSkus(): Promise<string[]> {
    return await this.purchaseService.subscriptionSkus();
  }
}
