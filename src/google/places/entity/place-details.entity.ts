import { Exclude } from 'class-transformer';

export class PlaceDetails {
  formatted_address: string;
  place_id: string;
  latitude: number;
  longitude: number;

  @Exclude()
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}
