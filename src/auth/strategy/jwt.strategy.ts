import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { SecretConfig } from '#/config/interfaces/secret-config.interface';
import secretConfig from '#/config/secret-config';
import { ERR_TYPE } from '#/filter/error-types';
import { extractUserAgent } from '#/utils/user-agent';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    @Inject(secretConfig.KEY)
    private readonly secretConfig: SecretConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretConfig.jwt,
      ignoreExpiration: false,
      algorithms: ['HS256'],
      passReqToCallback: true,
    } as StrategyOptions);
  }

  async validate(request: Request, payload: any): Promise<UserSession> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const user = await this.authService.getSessionFromToken(token);

    user.platform = extractUserAgent(request.headers['user-agent']).sysOS;

    if (!user) {
      throw new ForbiddenException(ERR_TYPE.ERR_SIGNIN_REQUIRED);
    }

    if (user.invalidatedAt) {
      throw new UnauthorizedException(ERR_TYPE.ERR_SESSION_EXPIRED);
    }

    return user;
  }
}
