import { getLogStr, omitSensitiveData } from '#/utils/logger';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  static BLACKLIST_URLS = ['/api/health'];
  static BLACKLIST_FIELDS = ['password', 'Authorization'];

  // constructor(
  //   @InjectPinoLogger(LoggerInterceptor.name)
  //   private readonly pinoLogger: PinoLogger,
  // ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const request = response.request || response.req;

    return next.handle().pipe(
      tap({
        next: (item) => {
          const log = {
            request: {
              url: request.url,
              protocol: request.protocol,
              method: request.method,
              host: request.hostname,
              userId: request.user?.userId,
              path: request.path,
              params: request.params,
              query: JSON.stringify(request.query),
              body: JSON.stringify(request.body),
              ip: request.ip,
              headers: JSON.stringify(request.headers),
            },
            response: {
              statusCode: response.statusCode,
              headers: { ...response.getHeaders() },
              body: JSON.stringify(item),
            },
            timestamp: Date.now(),
          };

          if (!LoggerInterceptor.BLACKLIST_URLS.includes(request.url)) {
            console.log(
              '[INCOMING REQUEST]',
              getLogStr(
                omitSensitiveData(LoggerInterceptor.BLACKLIST_FIELDS, log),
              ),
            );
          }
        },
      }),
    );
  }
}
