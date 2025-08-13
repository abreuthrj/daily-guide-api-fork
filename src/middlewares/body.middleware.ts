import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BodyMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    try {
      request.body = JSON.parse(request.body);
    } catch (err) {
      request.body = null;
    }

    next();
  }
}
