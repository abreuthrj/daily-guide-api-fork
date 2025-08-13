export interface Planet {
  id: number;
  name: PlanetEnum;
  fullDegree: number;
  normDegree: number;
  speed: number;
  isRetro: boolean;
  sign: ZodiacEnum;
  signLord: ZodiacEnum;
  nakshatra: string;
  nakshatraLord: ZodiacEnum;
  nakshatra_pad: number;
  house: number;
  is_planet_set: boolean;
  planet_awastha: string;
}

export interface Prediction {
  personal_life: string;
  profession: string;
  health: string;
  travel: string;
  luck: string;
  emotions: string;
}

export interface DailyPrediction {
  status: string;
  sun_sign: ZodiacEnum;
  prediction_date: string;
  prediction: Prediction;
}

export enum PlanetEnum {
  SUN = 'Sun',
  MOON = 'Moon',
  MARS = 'Mars',
  MERCURY = 'Mercury',
  JUPITER = 'Jupiter',
  VENUS = 'Venus',
  SATURN = 'Saturn',
  URANUS = 'Uranus',
  NEPTUNE = 'Neptune',
  PLUTO = 'Pluto',
  ASCENDANT = 'Ascendant',
}

export enum ZodiacEnum {
  ARIES = 'Aries',
  TAURUS = 'Taurus',
  GEMINI = 'Gemini',
  CANCER = 'Cancer',
  LEO = 'Leo',
  VIRGO = 'Virgo',
  LIBRA = 'Libra',
  SCORPIO = 'Scorpio',
  SAGITTARIUS = 'Sagittarius',
  CAPRICORN = 'Capricorn',
  AQUARIUS = 'Aquarius',
  PISCES = 'Pisces',
}
