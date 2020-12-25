import { ValidationArguments } from 'class-validator';
import {
  IsWaqiDailyForecastConstraint,
  IsWaqiIaqiConstraint,
  IsWaqiSTimeConstraint,
} from './custom-validators';
import * as constants from '../constants';

describe('Fetch external data script - custom validators', () => {
  describe('IsWaqiDailyForecast', () => {
    const constraint = new IsWaqiDailyForecastConstraint();

    test('should pass for a correct value', () => {
      expect(
        constraint.validate(
          {
            o3: [
              {
                avg: 5,
                max: 10,
                min: 0,
                day: '2020-12-05',
              },
            ],
          },
          {} as ValidationArguments,
        ),
      ).toBe(true);
    });

    const failures: { message: string; value: any }[] = [
      {
        message: 'the value is not an object',
        value: 'string',
      },
      {
        message: 'one of the key is not a known pollutant',
        value: {
          poll: [],
        },
      },
      {
        message: 'a pollutant value is not an array',
        value: {
          o3: 'string',
        },
      },
      {
        message: 'a pollutant value is an empty array',
        value: {
          o3: [],
        },
      },
      {
        message: 'a day forecast misses a key',
        value: {
          o3: [
            {
              min: 0,
              max: 10,
              avg: 5,
            },
          ],
        },
      },
      {
        message: 'a day forecast has an extra key',
        value: {
          o3: [
            {
              min: 0,
              max: 10,
              avg: 5,
              day: '2020-12-05',
              extraKey: 'string',
            },
          ],
        },
      },
      {
        message: 'a key is not correctly named',
        value: {
          o3: [
            {
              min: 0,
              max: 10,
              avg: 5,
              dayDay: '2020-12-05',
            },
          ],
        },
      },
      {
        message: 'if the day value is not a YYYY-MM-DD string',
        value: {
          o3: [
            {
              min: 0,
              max: 10,
              avg: 5,
              day: '05-12-2020',
            },
          ],
        },
      },
      {
        message: 'if a min/max/avg is not an integer',
        value: {
          o3: [
            {
              min: 0,
              max: 10,
              avg: 5.4,
              day: '2020-12-05',
            },
          ],
        },
      },
    ];

    failures.forEach(({ message, value }) => {
      test(`should fail if ${message}`, () => {
        expect(constraint.validate(value, {} as ValidationArguments)).toBe(false);
      });
    });
  });

  describe('IsWaqiSTimeConstraint', () => {
    const constraint = new IsWaqiSTimeConstraint();

    test('should pass for a correct value', () => {
      expect(constraint.validate('2020-12-05 12:13:14', {} as ValidationArguments)).toBe(true);
    });

    const failures: { message: string; value: any }[] = [
      {
        message: 'the value is not a string',
        value: 12,
      },
      {
        message: 'the date is wrong',
        value: '2020-13-05 12:13:14',
      },
      {
        message: 'the date does not have a time',
        value: '2020-13-05',
      },
    ];

    failures.forEach(({ message, value }) => {
      test(`should fail if ${message}`, () => {
        expect(constraint.validate(value, {} as ValidationArguments)).toBe(false);
      });
    });
  });

  describe('IsWaqiIaqi', () => {
    const constraint = new IsWaqiIaqiConstraint();

    // reduce WAQI_POLLUTANT_NAMES to a list of 2 to make it easier to test,
    // even though it requires a bit of magic :)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // noinspection JSConstantReassignment
    constants.WAQI_POLLUTANT_NAMES = ['o3', 't'];

    test('should pass for a correct value', () => {
      expect(
        constraint.validate(
          {
            o3: { v: 12.5 },
            t: { v: 4.7 },
          },
          {} as ValidationArguments,
        ),
      ).toBe(true);
    });

    test('should pass even if the temperature is negative', () => {
      expect(
        constraint.validate(
          {
            o3: { v: 12.5 },
            t: { v: -4.7 },
          },
          {} as ValidationArguments,
        ),
      ).toBe(true);
    });

    const failures: { message: string; value: any }[] = [
      {
        message: 'the value is not an object',
        value: 'string',
      },
      {
        message: 'a key is not properly named',
        value: {
          o2: { v: 12.5 },
          t: { v: 4.7 },
        },
      },
      {
        message: 'a pollutant value is not an object',
        value: {
          o2: { v: 12.5 },
          t: 'string',
        },
      },
      {
        message: 'a pollutant value has more than one key',
        value: {
          o2: { v: 12.5 },
          t: { v: 4.7, v2: 5.3 },
        },
      },
      {
        message: 'a pollutant value has no key',
        value: {
          o2: { v: 12.5 },
          t: {},
        },
      },
      {
        message: 'a pollutant value key is not named v',
        value: {
          o2: { v: 12.5 },
          t: { w: 4.7 },
        },
      },
      {
        message: 'a pollutant concentration is not a number',
        value: {
          o2: { v: 12.5 },
          t: { v: 'string' },
        },
      },
      {
        message: 'a pollutant concentration is negative',
        value: {
          o2: { v: -12.5 },
          t: { v: 4.7 },
        },
      },
    ];

    failures.forEach(({ message, value }) => {
      test(`should fail if ${message}`, () => {
        expect(constraint.validate(value, {} as ValidationArguments)).toBe(false);
      });
    });
  });
});
