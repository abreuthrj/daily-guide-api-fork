import { ERR_TYPE } from '#/filter/error-types';
import { extractUserAgent } from '#/utils/user-agent';
import { isMobile, versionCheck } from '#/utils/validation';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.headers['user-agent']) {
      throw new BadRequestException(ERR_TYPE.ERR_MISSING_DEVICE_INFO);
    }

    const { sysOS, appVersion } = extractUserAgent(
      request.headers['user-agent'],
    );

    if (!isMobile(sysOS)) {
      return next.handle();
    }

    if (!versionCheck(appVersion, process.env.APP_MOBILE_VERSION)) {
      throw new ForbiddenException(ERR_TYPE.ERR_UPDATE_REQUIRED);
    }

    return next.handle();
  }
}
