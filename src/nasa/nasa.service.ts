import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { URLSearchParams } from 'url';

@Injectable()
export class NasaService {
  private static BASE_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';

  constructor() {}

  async getPlanetsPosition(date: Date, localOfBirth: string): Promise<any> {
    const params = new URLSearchParams({
      format: 'json',
      COMMAND: '10', // MB FOR LIST WITH ALL MAJOR BODIES
    });

    const result = await axios.get(`?${params.toString()}`, {
      baseURL: NasaService.BASE_URL,
    });

    return result.data;
  }
}
