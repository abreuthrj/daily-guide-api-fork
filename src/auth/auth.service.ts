import { DynamoDBService } from '#/aws/dynamodb/dynamodb.service';
import { UserRole, UserRoleEnum } from '#/aws/dynamodb/entity/user-role.entity';
import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { ERR_TYPE } from '#/filter/error-types';
import { FirebaseService } from '#/firebase/firebase.service';
import { PurchaseService } from '#/purchase/purchase.service';
import { User } from '#/user/entity/user.entity';
import { extractUserAgent } from '#/utils/user-agent';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import * as bcrypt from 'bcrypt';
import * as GeneratePassword from 'generate-password';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenResponse } from './interfaces/token-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private firebaseService: FirebaseService,
    private purchaseService: PurchaseService,
    private dynamodbService: DynamoDBService,
  ) {}

  async getSessionFromToken(token: string): Promise<UserSession> {
    const [userSession] = await this.dynamodbService.query<UserSession>(
      UserSession.TableName,
      { id: token },
    );

    if (!userSession || userSession?.removedAt) {
      return null;
    }

    return userSession;
  }

  async getUserFromId(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    return user;
  }

  async signUser(user: User): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      name: user.displayName,
    };

    const token = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(
      { ...payload, token },
      { expiresIn: '7d' },
    );

    const decoded = this.jwtService.decode(token) as Record<string, any>;

    const expiresAt = new Date((decoded?.exp as number) * 1000).getTime();

    return { token, refreshToken, expiresAt };
  }

  async refresh(refreshDto: RefreshDto): Promise<TokenResponse> {
    const refreshPayload = this.jwtService.decode(
      refreshDto.refreshToken,
    ) as JwtPayload;

    if (!refreshPayload?.token) {
      throw new BadRequestException(ERR_TYPE.ERR_UNRELATED_TOKEN);
    }

    const [userSession] = await this.dynamodbService.query<UserSession>(
      UserSession.TableName,
      { id: refreshPayload.token },
    );

    if (userSession.removedAt) {
      throw new BadRequestException(ERR_TYPE.ERR_UNRELATED_TOKEN);
    }

    await this.removeSession(userSession.id);

    const user = await this.userRepository.findOneBy({
      id: userSession.userId,
    });

    const newTokens = await this.signUser(user);

    await this.createSession(user, newTokens);

    return { token: newTokens.token, refreshToken: newTokens.refreshToken };
  }

  async authenticate(authDto: AuthDto, userAgent: string): Promise<User> {
    const { uid, email, picture, firebase } =
      await this.firebaseService.getIdFromToken(authDto.firebaseToken);

    let user = await this.userRepository.findOneBy({
      email: email,
    });

    if (!user) {
      const passwordContent =
        process.env.NODE_ENV === 'production'
          ? GeneratePassword.generate({
              length: 10,
              numbers: true,
              symbols: true,
            })
          : 'daily+guide123';

      const password = await bcrypt.hash(passwordContent, 10);

      user = User.create({
        firebaseUUID: uid,
        providerId: firebase.sign_in_provider,
        email,
        password,
        isAnonymous: authDto.isAnonymous || false,
        displayName: authDto.displayName,
      });
    }

    user.photoURL = authDto.photoURL || picture;
    await user.save();

    const userSession = await this.updateSession(user);
    userSession.platform = extractUserAgent(userAgent).sysOS;

    user.subscribed = (await this.purchaseService.status(userSession)).success;
    user.token = userSession.id;
    user.refreshToken = userSession.refreshToken;

    return user;
  }

  async signin(signinDto: SigninDto): Promise<User> {
    const user = await User.findOneBy({
      email: signinDto.email,
    });

    if (!user) {
      throw new NotFoundException(ERR_TYPE.ERR_USER_NOT_FOUND);
    }

    if (await bcrypt.compare(signinDto.password, user.password)) {
      const userSession = await this.updateSession(user);

      user.token = userSession.id;
      user.refreshToken = userSession.refreshToken;
      return user;
    }

    throw new UnauthorizedException(ERR_TYPE.ERR_SIGNIN_CREDENTIALS);
  }

  async createSession(
    user: User,
    newTokens: TokenResponse,
  ): Promise<UserSession> {
    const userSession = new UserSession();
    userSession.id = newTokens.token;
    userSession.createdAt = new Date().getTime();
    userSession.refreshToken = newTokens.refreshToken;
    userSession.expiresAt = newTokens.expiresAt;
    userSession.email = user.email;
    userSession.userId = user.id;
    userSession.roles = await this.getRolesFromEmail(user.email);

    await this.dynamodbService.save(UserSession.TableName, userSession);

    return userSession;
  }

  async getRolesFromEmail(email: string): Promise<UserRoleEnum[]> {
    const [userRoles] = await this.dynamodbService.query<UserRole>(
      UserRole.TableName,
      { id: email },
    );

    return userRoles?.roles ?? [];
  }

  async updateSession(user: User): Promise<UserSession> {
    let userSession = await this.getSessionFromId(user.id);

    if (!userSession) {
      const newTokens = await this.signUser(user);
      userSession = await this.createSession(user, newTokens);
      user.token = newTokens.token;
      user.refreshToken = newTokens.refreshToken;
    }

    return userSession;
  }

  async getSessionFromId(userId: string): Promise<UserSession> {
    const [userSession] = await this.dynamodbService.query<UserSession>(
      UserSession.TableName,
      { userId },
      'attribute_not_exists(removedAt) AND attribute_not_exists(invalidatedAt)',
      'userId-index',
    );

    if (!userSession) {
      return null;
    }

    return userSession;
  }

  async invalidateSession(id: string): Promise<void> {
    const session: Partial<UserSession> = {
      invalidatedAt: Date.now(),
    };

    await this.dynamodbService.update(UserSession.TableName, { id }, session);
  }

  async removeSession(id: string): Promise<void> {
    const session: Partial<UserSession> = {
      removedAt: Date.now(),
    };

    await this.dynamodbService.update(UserSession.TableName, { id }, session);
  }
}
