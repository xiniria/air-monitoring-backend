import {
  isArray,
  isInt,
  isISO8601,
  isNumber,
  isObject,
  isString,
  min,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { WAQI_POLLUTANT_NAMES } from '../constants';

@ValidatorConstraint()
export class IsWaqiDailyForecastConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    if (!isObject(value)) return false;
    const keys = Object.keys(value);
    for (const key of keys) {
      if (![...WAQI_POLLUTANT_NAMES, 'uvi'].includes(key)) return false;
      if (!isArray(value[key]) || value[key].length === 0) return false;

      for (const day of value[key]) {
        const valueKeys = Object.keys(day);
        if (valueKeys.length !== 4) return false;
        for (const subKey of ['min', 'max', 'avg', 'day']) {
          if (!valueKeys.includes(subKey)) return false;
          if (subKey === 'day' && !isISO8601(`${day[subKey]}T00:00:00Z`)) {
            return false;
          }
          if (subKey !== 'day' && !isInt(day[subKey])) {
            return false;
          }
        }
      }
    }
    return true;
  }
}

export function IsWaqiDailyForecast(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsWaqiDailyForecast',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsWaqiDailyForecastConstraint,
    });
  };
}

@ValidatorConstraint()
export class IsWaqiSTimeConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    if (!isString(value)) return false;
    return isISO8601(`${value.replace(/ /, 'T')}Z`, { strict: true });
  }
}

export function IsWaqiSTime(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsWaqiSTime',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsWaqiSTimeConstraint,
    });
  };
}

@ValidatorConstraint()
export class IsWaqiIaqiConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    if (!isObject(value)) return false;
    const keys = Object.keys(value);
    for (const key of keys) {
      if (!WAQI_POLLUTANT_NAMES.includes(key)) return false;
      if (!isObject(value[key])) return false;
      const valueKeys = Object.keys(value[key]);
      if (valueKeys.length !== 1 || valueKeys[0] !== 'v') return false;
      if (!isNumber(value[key].v) || !min(value[key].v, 0)) {
        return false;
      }
    }
    return true;
  }
}

export function IsWaqiIaqi(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsWaqiIaqi',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsWaqiIaqiConstraint,
    });
  };
}
