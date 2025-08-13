import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { IS_SUBSCRIBED_KEY } from '#/decorator/subscribed.decorator';
import { PurchaseService } from '#/purchase/purchase.service';
import { extractUserAgent } from '#/utils/user-agent';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly purchaseService: PurchaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSubscribed = this.reflector.getAllAndOverride<boolean>(
      IS_SUBSCRIBED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isSubscribed) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userSession = request.user as UserSession;

    userSession.platform = extractUserAgent(
      request.headers['user-agent'],
    ).sysOS;

    const result = await this.purchaseService.status(userSession);

    return result.success;
  }
}
