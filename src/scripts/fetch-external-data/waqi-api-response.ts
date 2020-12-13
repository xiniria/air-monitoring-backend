import { WaqiPollutantName } from './constants';

export interface WaqiApiSuccess {
  status: 'ok';
  data: {
    aqi: number;
    idx: number;
    attributions: {
      url: string;
      name: string;
      logo?: string;
    }[];
    city: {
      geo: [number, number];
      name: string;
      url: string;
    };
    dominentpol: WaqiPollutantName;
    iaqi: {
      [key in WaqiPollutantName]: {
        v: number;
      };
    };
    time: {
      s: string;
      tz: string;
      v: number;
      iso: string;
    };
    forecast: {
      daily: {
        [key in WaqiPollutantName]: {
          avg: number;
          day: string;
          min: number;
          max: number;
        }[];
      };
    };
    debug: {
      sync: string;
    };
  };
}

export interface WaqiApiFailure {
  status: 'error';
  message: string;
}

export type WaqiApiResponse = WaqiApiSuccess | WaqiApiFailure;

export function responseIsError(res: WaqiApiResponse): res is WaqiApiFailure {
  return res.status === 'error';
}
