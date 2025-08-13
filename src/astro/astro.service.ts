import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import astroConfig from '#/config/astro-config';
import { AstroConfig } from '#/config/interfaces/astro-config.interface';
import { LatLon } from '#/interfaces/utils.interface';
import { OpenaiService } from '#/openai/openai.service';
import {
  AttributeSlugsEnum,
  UserAttribute,
} from '#/user/entity/user-attribute.entity';
import { User } from '#/user/entity/user.entity';
import { HttpUtil } from '#/utils/http';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { btoa } from 'buffer';
import {
  DailyPrediction,
  Planet,
  ZodiacEnum,
} from './interfaces/horoscope.interface';
import { Numerology } from './interfaces/numerology.interface';

@Injectable()
export class AstroService {
  private readonly httpUtil: HttpUtil;

  constructor(
    @Inject(astroConfig.KEY)
    private readonly astroConfig: AstroConfig,
    private readonly configService: ConfigService,
    private readonly openaiService: OpenaiService,
  ) {
    this.httpUtil = new HttpUtil();
    this.httpUtil.setup('https://json.astrologyapi.com/v1', {
      headers: {
        Authorization: `Basic ${btoa(
          `${this.astroConfig.user_id}:${this.astroConfig.api_key}`,
        )}`,
        'Content-Type': 'application/json',
      },
    });

    this.httpUtil.interceptors.response.use((response) => {
      if (response.status >= 200 && response.status <= 299) {
        return response.data;
      }

      return response;
    });
  }

  async chart(date: Date, latlon: LatLon): Promise<Planet[]> {
    const result = await this.httpUtil.post<Planet[], Planet[]>(
      '/planets/tropical',
      this.getBody(date, latlon, -3),
    );

    return result;
  }

  async planets(userSession: UserSession): Promise<Planet[]> {
    const user = await User.findOneBy({
      id: userSession.userId,
    });

    return await this.planetsForUser(user);
  }

  async planetsForUser(user: User): Promise<Planet[]> {
    const latlon: LatLon = { lat: user.latitude, lon: user.longitude };

    const data = this.getBody(user.birthdate, latlon, user.utcOffset);

    console.log(data);

    const result = await this.httpUtil.post<Planet[], Planet[]>(
      '/planets',
      data,
    );

    return result;
  }

  async horoscope(
    userSession: UserSession,
    zodiacName: ZodiacEnum,
  ): Promise<DailyPrediction> {
    const user = await User.findOneBy({
      id: userSession.userId,
    });

    return await this.horoscopeForUser(user, zodiacName);
  }

  async horoscopeForUser(
    user: User,
    zodiacName: string,
  ): Promise<DailyPrediction> {
    const latlon: LatLon = { lat: user.latitude, lon: user.longitude };

    const result = await this.httpUtil.post<DailyPrediction, DailyPrediction>(
      `/sun_sign_prediction/daily/${zodiacName.toLowerCase()}`,
      this.getBody(user.birthdate, latlon, user.utcOffset),
    );

    return result;
  }

  async numerology(userSession: UserSession): Promise<Numerology> {
    const user = await User.findOneBy({
      id: userSession.userId,
    });

    const latlon: LatLon = { lat: user.latitude, lon: user.longitude };

    const result = await this.httpUtil.post<Numerology, Numerology>(
      '/numerological_numbers',
      {
        ...this.getBody(user.birthdate, latlon, user.utcOffset),
        name: user.displayName,
      },
    );

    return result;
  }

  async syncPlanets(userSession: UserSession): Promise<Planet[]> {
    const user = await User.findOneBy({
      id: userSession.userId,
    });

    user.planets = await this.planetsForUser(user);

    await user.save();

    return user.planets;
  }

  async generateAttributes(
    user: User,
    onlyIfNotExists?: boolean,
  ): Promise<UserAttribute[]> {
    const latlon: LatLon = { lat: user.latitude, lon: user.longitude };

    const EXTRACT_URL = {
      [AttributeSlugsEnum.PERSONALITY]: '/personality_report/tropical',
      [AttributeSlugsEnum.ASCENDANT]: '/general_ascendant_report',
      [AttributeSlugsEnum.MOON]: '/moon_phase_report',
    };
    const EXTRACT_RESPONSE = {
      [AttributeSlugsEnum.PERSONALITY]: (personality: any) =>
        personality.report[0],
      [AttributeSlugsEnum.ASCENDANT]: (personality: any) =>
        personality.asc_report.report,
      [AttributeSlugsEnum.MOON]: (personality: any) => personality.report,
    };

    const userAttributes = await Promise.all(
      Object.values(AttributeSlugsEnum).map(async (attribute) => {
        let personalityAttribute = await UserAttribute.findOneBy({
          slug: attribute,
          user: { id: user.id },
        });

        if (onlyIfNotExists && personalityAttribute) {
          return personalityAttribute;
        }

        const response = await this.httpUtil.post<any, any>(
          EXTRACT_URL[attribute],
          {
            ...this.getBody(user.birthdate, latlon, user.utcOffset),
            name: user.displayName,
          },
        );

        personalityAttribute = personalityAttribute ?? new UserAttribute();
        personalityAttribute.title = `user_attribute-${attribute}-title`;
        personalityAttribute.value = await this.openaiService.translate(
          user,
          EXTRACT_RESPONSE[attribute](response),
          50,
        );
        personalityAttribute.slug = attribute;
        personalityAttribute.user = user;

        return await personalityAttribute.save();
      }),
    );

    return userAttributes;
  }

  getNumerology(dateOfBirth: Date) {
    let numerology = 0;

    const year = dateOfBirth.getUTCFullYear();
    const month = dateOfBirth.getUTCMonth();
    const day = dateOfBirth.getUTCDate();

    numerology += year
      .toString()
      .split('')
      .reduce((prev, cur) => prev + parseInt(cur), 0);
    numerology += month
      .toString()
      .split('')
      .reduce((prev, cur) => prev + parseInt(cur), 0);
    numerology += day
      .toString()
      .split('')
      .reduce((prev, cur) => prev + parseInt(cur), 0);

    while (numerology.toString().length > 1) {
      numerology = numerology
        .toString()
        .split('')
        .reduce((prev, cur) => prev + parseInt(cur), 0);
    }

    return numerology;
  }

  private getBody(date: Date, latlon: LatLon, timezone: number) {
    const userDate = new Date(date.getTime() + timezone * 3600000);

    return {
      day: userDate.getUTCDate(),
      month: userDate.getUTCMonth() + 1,
      year: userDate.getUTCFullYear(),
      hour: userDate.getUTCHours(),
      min: userDate.getUTCMinutes(),
      lat: latlon.lat,
      lon: latlon.lon,
      tzone: timezone,
      timezone,
    };
  }
}
