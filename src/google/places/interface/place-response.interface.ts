import { PlaceDetails } from '../entity/place-details.entity';
import { Place } from '../entity/place.entity';

export interface PlaceDetailsResponse {
  result: PlaceDetails;
}

export interface PlaceResponse {
  predictions: Place[];
}
