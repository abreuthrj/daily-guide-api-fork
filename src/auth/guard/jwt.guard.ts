import { IS_DEVELOPMENT_KEY } from '#/decorator/development.decorator';
import { IS_PUBLIC_KEY } from '#/decorator/public.decorator';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isDevelopment = this.reflector.getAllAndOverride<boolean>(
      IS_DEVELOPMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isDevelopment && process.env.NODE_ENV === 'production') {
      return false;
    }

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
