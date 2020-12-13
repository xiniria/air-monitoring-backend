import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsWaqiDailyForecast, IsWaqiIaqi, IsWaqiSTime } from './custom-validators';
import { WAQI_POLLUTANT_NAMES, WaqiPollutantName } from '../constants';

class WaqiAttributionValidator {
  @IsUrl()
  url: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

class WaqiCityValidator {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @Min(-180, { each: true })
  @Max(180, { each: true })
  geo: [number, number];

  @IsString()
  name: string;

  @IsUrl()
  url: string;
}

class WaqiTimeValidator {
  @IsWaqiSTime()
  s: string;

  @IsString()
  @Matches(/^[-+]\d{2}:\d{2}$/)
  tz: string;

  @IsInt()
  @Min(0)
  v: number;

  @IsISO8601({ strict: true })
  iso: string;
}

class WaqiDebugValidator {
  @IsISO8601()
  sync: string;
}

class WaqiForecastValidator {
  @IsWaqiDailyForecast()
  daily: {
    [key in WaqiPollutantName]: {
      avg: number;
      day: string;
      min: number;
      max: number;
    }[];
  };
}

export class WaqiDataValidator {
  @ValidateIf((obj) => typeof obj.aqi === 'number')
  @IsInt()
  @Min(0)
  @Max(500)
  aqi: number;

  @IsInt()
  @IsPositive()
  idx: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaqiAttributionValidator)
  attributions: WaqiAttributionValidator[];

  @ValidateNested()
  @Type(() => WaqiCityValidator)
  city: WaqiCityValidator;

  @IsString()
  @IsIn([...WAQI_POLLUTANT_NAMES, ''])
  dominentpol: WaqiPollutantName;

  @IsWaqiIaqi()
  iaqi: {
    [key in WaqiPollutantName]: {
      v: number;
    };
  };

  @ValidateNested()
  @Type(() => WaqiTimeValidator)
  time: WaqiTimeValidator;

  @ValidateNested()
  @Type(() => WaqiForecastValidator)
  forecast: WaqiForecastValidator;

  @ValidateNested()
  @Type(() => WaqiDebugValidator)
  debug: WaqiDebugValidator;
}
