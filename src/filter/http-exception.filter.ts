import { isMobile } from '#/utils/validation';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { ERR_MESSAGES, ERR_TYPE } from './error-types';

@Catch(HttpException, AxiosError, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const timestamp = Date.now();

    if (exception instanceof AxiosError) {
      const message = exception.response?.data || exception.message;

      const status = exception.response?.status || exception.status || 500;

      response.status(status).json({
        status: status,
        type: ERR_TYPE.ERR_SERVICE_FAILED,
        message:
          typeof message === 'object' ? JSON.stringify(message) : message,
        timestamp,
      });

      return;
    }

    if (exception instanceof UnprocessableEntityException) {
      const details = exception.getResponse();

      const status = exception.getStatus();
      const message = ERR_MESSAGES[ERR_TYPE.ERR_MISSING_FIELD].replace(
        '#',
        typeof details === 'string'
          ? details
          : Object.entries((details as any)?.message)
              .map(([key, val]) => `${key}: ${(val as []).join(', ')}`)
              .join('; '),
      );
      const type = ERR_TYPE.ERR_MISSING_FIELD;

      response.status(status).json({
        status,
        type,
        message,
        timestamp,
      });

      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = ERR_MESSAGES[exception.message] || exception.message;
      const type = Object.values(ERR_TYPE).find(
        (type) => type === exception.message,
      )
        ? exception.message
        : exception.name;

      response.status(status).json({
        status,
        type,
        message,
        timestamp,
        details: this.handleDetails(type, exception, request, response),
      });

      return;
    }

    const status = 500;
    const message = ERR_MESSAGES[ERR_TYPE.ERR_UNKNOWN];
    const type = ERR_TYPE.ERR_UNKNOWN;
    const details =
      process.env.NODE_ENV === 'production'
        ? exception?.message
        : exception?.stack;

    response.status(status).json({
      status,
      type,
      message,
      timestamp,
      details,
    });
  }

  handleDetails(
    type: string,
    exception: HttpException,
    request: Request,
    response: Response,
  ) {
    if (type !== ERR_TYPE.ERR_UPDATE_REQUIRED) {
      return;
    }

    if (!request.headers['user-agent']) {
      return;
    }

    const [device] = request.headers['user-agent'].split('|');

    if (!isMobile(device)) {
      return;
    }

    if (/android/i.test(device)) {
      return 'https://play.google.com/store/apps/details?id=cc.kokedama.dailyguide';
    }
    if (/ios/i.test(device)) {
      return 'https://play.google.com/store/apps/details?id=cc.kokedama.dailyguide';
    }
  }
}
