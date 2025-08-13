import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { AuthUser } from '#/decorator/auth-user.decorator';
import { Development } from '#/decorator/development.decorator';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AstroService } from './astro.service';
import { Planet } from './interfaces/horoscope.interface';
import { Numerology } from './interfaces/numerology.interface';

@ApiTags('Astro')
@Controller('astro')
export class AstroController {
  constructor(private readonly astroService: AstroService) {}

  @ApiResponse({
    description: 'Get user planets position',
  })
  @Get('planets')
  async planets(@AuthUser() userSession: UserSession): Promise<Planet[]> {
    return this.astroService.planets(userSession);
  }

  @ApiResponse({
    description: "Get user's numerology",
  })
  @Get('numerology')
  async numerology(@AuthUser() userSession: UserSession): Promise<Numerology> {
    return this.astroService.numerology(userSession);
  }

  @ApiResponse({
    description: "Get user's astro info",
  })
  @Get('info')
  async info(
    @AuthUser() userSession: UserSession,
  ): Promise<Record<string, any>> {
    const info: Record<string, any> = {};

    // info.numerology = this.astroService.getNumerology(new Date(userSession.birthdate));

    return info;
  }

  @Development()
  @ApiResponse({
    description: "Get user's planets",
  })
  @Post('planets')
  async syncPlanets(@AuthUser() userSession: UserSession): Promise<Planet[]> {
    return this.astroService.syncPlanets(userSession);
  }
}
