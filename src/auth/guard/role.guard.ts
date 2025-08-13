import { UserRoleEnum } from '#/aws/dynamodb/entity/user-role.entity';
import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { HAS_ROLE_KEY } from '#/decorator/role.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      HAS_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userSession = request.user as UserSession;

    for (const role of roles) {
      if (userSession.roles?.includes(role)) {
        return true;
      }
    }

    return false;
  }
}
