import googleConfig from '#/config/google-config';
import { GoogleConfig } from '#/config/interfaces/google-config.interface';
import { HttpUtil } from '#/utils/http';
import { Inject, Injectable } from '@nestjs/common';
import { PlaceDetails } from './entity/place-details.entity';
import { Place } from './entity/place.entity';
import {
  PlaceDetailsResponse,
  PlaceResponse,
} from './interface/place-response.interface';

@Injectable()
export class GooglePlaceService {
  private readonly httpUtil: HttpUtil;

  constructor(
    @Inject(googleConfig.KEY)
    private readonly googleConfig: GoogleConfig,
  ) {
    this.httpUtil = new HttpUtil();
    this.httpUtil.setup('https://maps.googleapis.com/maps/api/place');
  }

  async autocomplete(input: string): Promise<Place[]> {
    const response = await this.httpUtil.get<PlaceResponse>(
      '/autocomplete/json',
      {
        params: {
          input,
          key: this.googleConfig.key,
        },
      },
    );

    const result = response.data.predictions.map((place) => ({
      description: place.description,
      place_id: place.place_id,
    }));

    return result;
  }

  async details(placeId: string): Promise<PlaceDetails> {
    const response = await this.httpUtil.get<PlaceDetailsResponse>(
      '/details/json',
      {
        params: {
          place_id: placeId,
          key: this.googleConfig.key,
        },
      },
    );

    const result = new PlaceDetails();
    result.formatted_address = response.data.result.formatted_address;
    result.latitude = response.data.result.geometry.location.lat;
    result.longitude = response.data.result.geometry.location.lng;
    result.place_id = response.data.result.place_id;

    return result;
  }
}
