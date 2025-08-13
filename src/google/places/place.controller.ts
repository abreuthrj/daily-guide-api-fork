import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlaceDetails } from './entity/place-details.entity';
import { Place } from './entity/place.entity';
import { GooglePlaceService } from './place.service';

@ApiTags('place')
@Controller('place')
export class GooglePlaceController {
  constructor(private readonly googlePlaceService: GooglePlaceService) {}

  @ApiResponse({
    type: [Place],
    description: 'Get google place autocomplete',
  })
  @Get('autocomplete')
  async autocomplete(@Query('input') input: string): Promise<Place[]> {
    return await this.googlePlaceService.autocomplete(input);
  }

  @ApiResponse({
    type: [PlaceDetails],
    description: 'Get google place details',
  })
  @Get('details/:placeId')
  async details(@Param('placeId') placeId: string): Promise<PlaceDetails> {
    return await this.googlePlaceService.details(placeId);
  }
}
