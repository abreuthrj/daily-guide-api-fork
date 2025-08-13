import { AstroService } from '#/astro/astro.service';
import { ZodiacEnum } from '#/astro/interfaces/horoscope.interface';
import { AuthService } from '#/auth/auth.service';
import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { Result } from '#/entity/result.entity';
import { ERR_TYPE } from '#/filter/error-types';
import { GooglePlaceService } from '#/google/places/place.service';
import { OpenaiService } from '#/openai/openai.service';
import { PurchaseService } from '#/purchase/purchase.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserDto } from './dto/user.dto';
import { UserAttribute } from './entity/user-attribute.entity';
import { GenderEnum, User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly astroService: AstroService,
    private readonly authService: AuthService,
    private readonly openaiService: OpenaiService,
    private readonly googlePlaceService: GooglePlaceService,
    private readonly purchaseService: PurchaseService,
  ) {}

  async all(): Promise<User[]> {
    const users = await User.find({
      relations: { purchases: true },
    });

    return users;
  }

  async me(userSession: UserSession): Promise<User> {
    const user = await User.findOneBy({
      id: userSession.userId,
    });

    await this.astroService.generateAttributes(user, true);

    user.subscribed = (await this.purchaseService.status(userSession)).success;
    user.attributes = await UserAttribute.findBy({
      user: {
        id: user.id,
      },
    });

    return user;
  }

  async update(userSession: UserSession, userDto: UserDto): Promise<User> {
    const user = await User.findOneBy({
      id: userSession.userId,
    });

    if (!user) {
      throw new UnauthorizedException(ERR_TYPE.ERR_USER_NOT_FOUND);
    }

    user.displayName = userDto.displayName || user.displayName;
    user.birthdate = userDto.dateOfBirth
      ? new Date(userDto.dateOfBirth)
      : user.birthdate;
    user.email = user.email || `anonymous-${randomUUID()}@kokedama.cc`;
    user.photoURL = userDto.photoURL || user.photoURL;
    user.notificationTime = userDto.notificationTime || user.notificationTime;
    user.gender = userDto.gender || user.gender;
    user.fcmToken = userDto.fcmToken;
    user.utcOffset = userDto.utcOffset
      ? -userDto.utcOffset / 60
      : user.utcOffset;
    user.language = userDto.language || user.language || 'en';

    if (
      userDto.dateOfBirth &&
      new Date(user.birthdate).getFullYear > new Date().getFullYear
    ) {
      throw new BadRequestException(ERR_TYPE.ERR_INVALID_BIRTHDATE);
    }

    if (
      userDto.gender &&
      !Object.values(GenderEnum).find((gender) => gender === user.gender)
    ) {
      throw new UnprocessableEntityException({
        message: {
          gender: ['field is required'],
        },
      });
    }

    if (userDto.placeId) {
      try {
        const place = await this.googlePlaceService.details(userDto.placeId);

        user.latitude = place.latitude;
        user.longitude = place.longitude;
        user.address = place.formatted_address;
        user.placeId = place.place_id;
      } catch (err) {
        throw new BadRequestException(ERR_TYPE.ERR_INVALID_PLACE);
      }
    }

    if (!user.planets?.length && user.latitude && user.longitude) {
      user.planets = await this.astroService.planetsForUser(user);
    }

    user.updatedAt = new Date();

    await user.save();

    return user;
  }

  async flush(): Promise<Result> {
    const result = new Result();

    await User.clear();

    result.success = true;

    return result;
  }

  async generateAttributes(userSession: UserSession): Promise<UserAttribute[]> {
    const user = await User.findOneBy({
      id: userSession.userId,
    });

    return await this.astroService.generateAttributes(user);
  }

  getSign(user: User): ZodiacEnum {
    const dateOfBirth = new Date(user.birthdate);

    const stopPoints = [
      { day: 20, sign: ZodiacEnum.AQUARIUS },
      { day: 19, sign: ZodiacEnum.PISCES },
      { day: 21, sign: ZodiacEnum.ARIES },
      { day: 21, sign: ZodiacEnum.TAURUS },
      { day: 21, sign: ZodiacEnum.GEMINI },
      { day: 21, sign: ZodiacEnum.CANCER },
      { day: 23, sign: ZodiacEnum.LEO },
      { day: 23, sign: ZodiacEnum.VIRGO },
      { day: 23, sign: ZodiacEnum.LIBRA },
      { day: 23, sign: ZodiacEnum.SCORPIO },
      { day: 22, sign: ZodiacEnum.SAGITTARIUS },
      { day: 22, sign: ZodiacEnum.CAPRICORN },
    ];

    const month = dateOfBirth.getMonth();
    const day = dateOfBirth.getDate();

    if (day >= stopPoints[month].day) {
      return stopPoints[month].sign;
    }

    return month > 1
      ? stopPoints[month - 1].sign
      : stopPoints[stopPoints.length - 1].sign;
  }
}
