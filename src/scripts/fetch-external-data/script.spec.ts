import { mocked } from 'ts-jest/utils';
import fetch from 'node-fetch';
import { Response } from 'node-fetch';
import { Repository } from 'typeorm';
import { Pollutant, PollutantData, Station } from '../../entities';
import { mockRepositoryFactory } from '../../util/mock-database';
import { insertDataInDb, makeApiRequest, validateApiResponse } from './script';
import { WaqiApiSuccess } from './waqi-api-response';

jest.mock('node-fetch');
const mockedFetch = mocked(fetch);

const createMockResponse = (data: any): Promise<Response> =>
  Promise.resolve(({
    json() {
      return data;
    },
  } as unknown) as Response);

describe('Fetch external data script', () => {
  const now = new Date().toISOString();

  const station: Station = {
    id: 1,
    name: 'My station',
    latitude: 41.57,
    longitude: -9.34,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    externalId: 1,
  };

  const pollutantCo: Pollutant = {
    id: 1,
    shortName: 'CO',
    fullName: 'Carbon monoxide',
    description: 'A pollutant',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    waqiName: 'co',
    isPollutant: true,
  };

  const pollutantNo2: Pollutant = {
    id: 2,
    shortName: 'NO2',
    fullName: 'Nitrogen dioxide',
    description: 'A pollutant',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    waqiName: 'no2',
    isPollutant: true,
  };

  const pollutantAqi: Pollutant = {
    id: 3,
    shortName: 'AQI',
    fullName: 'Air Quality Index',
    description: 'Air quality index',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    waqiName: 'aqi',
    isPollutant: true,
  };

  describe('makeApiRequest', () => {
    it('should return the parsed JSON response if there was no error fetching the data', async () => {
      const mockData = {
        status: 'ok',
        data: {},
      };
      mockedFetch.mockResolvedValue(createMockResponse(mockData));

      const data = await makeApiRequest(station);
      expect(mockedFetch).toHaveBeenCalled();
      expect(data).toBe(mockData);
    });

    it('should throw an error if the response status is not "ok"', async () => {
      const mockData = {
        status: 'error',
        message: 'Mock error',
      };
      mockedFetch.mockResolvedValue(createMockResponse(mockData));

      await expect(() => makeApiRequest(station)).rejects.toThrowError(
        new Error('WAQI API responded with an error for station with id 1: "Mock error"'),
      );
    });

    it('should throw an error if node-fetch failed', async () => {
      const error = new Error('Mock error');
      mockedFetch.mockImplementation(() => {
        throw error;
      });

      await expect(() => makeApiRequest(station)).rejects.toThrowError(
        new Error('There was an error fetching data on the WAQI API: Error: Mock error'),
      );
    });
  });

  describe('validateApiResponse', () => {
    it('should do nothing if the validation passes', async () => {
      const response: WaqiApiSuccess = {
        status: 'ok',
        data: {
          aqi: 20,
          idx: station.externalId,
          attributions: [{ url: 'http://www.airparif.asso.fr/', name: 'AirParif' }],
          city: {
            geo: [48.8686, 2.31166],
            name: 'Paris',
            url: 'https://aqicn.org/city/france/paris/avenue-des-champs-elysees',
          },
          dominentpol: 'pm10',
          iaqi: {
            co: { v: 0.1 },
            h: { v: 80.7 },
            no2: { v: 11.1 },
            o3: { v: 8.2 },
            p: { v: 992.5 },
            pm10: { v: 8 },
            pm25: { v: 13 },
            so2: { v: 0.6 },
            t: { v: 6.1 },
            w: { v: 1.5 },
            wg: { v: 7.2 },
          },
          time: {
            s: '2020-12-05 13:00:00',
            tz: '+01:00',
            v: 1607173200,
            iso: '2020-12-05T13:00:00+01:00',
          },
          forecast: {
            daily: {
              o3: [
                { avg: 19, day: '2020-12-05', max: 25, min: 13 },
                { avg: 7, day: '2020-12-06', max: 20, min: 2 },
                { avg: 3, day: '2020-12-07', max: 9, min: 1 },
                { avg: 4, day: '2020-12-08', max: 13, min: 1 },
                { avg: 4, day: '2020-12-09', max: 6, min: 4 },
              ],
              pm10: [
                { avg: 8, day: '2020-12-05', max: 13, min: 6 },
                { avg: 17, day: '2020-12-06', max: 24, min: 8 },
                { avg: 30, day: '2020-12-07', max: 33, min: 20 },
                { avg: 28, day: '2020-12-08', max: 32, min: 20 },
                { avg: 28, day: '2020-12-09', max: 28, min: 27 },
              ],
              pm25: [
                { avg: 26, day: '2020-12-05', max: 40, min: 15 },
                { avg: 52, day: '2020-12-06', max: 66, min: 24 },
                { avg: 85, day: '2020-12-07', max: 93, min: 67 },
                { avg: 76, day: '2020-12-08', max: 84, min: 66 },
                { avg: 80, day: '2020-12-09', max: 80, min: 78 },
              ],
              uvi: [
                { avg: 0, day: '2020-12-05', max: 0, min: 0 },
                { avg: 0, day: '2020-12-06', max: 0, min: 0 },
                { avg: 0, day: '2020-12-07', max: 0, min: 0 },
                { avg: 0, day: '2020-12-08', max: 0, min: 0 },
                { avg: 0, day: '2020-12-09', max: 1, min: 0 },
                { avg: 0, day: '2020-12-10', max: 0, min: 0 },
              ],
            },
          },
          debug: {
            sync: '2020-12-05T22:17:22+09:00',
          },
        },
      };
      await expect(validateApiResponse(response, station)).resolves.not.toThrow();
    });

    it('should throw if validation fails', async () => {
      const response: WaqiApiSuccess = {
        status: 'ok',
        data: {
          aqi: 20,
          idx: -station.externalId,
          attributions: [{ url: 'not a url', name: 'AirParif' }],
          city: {
            geo: [48.8686, 2.31166],
            name: 'Paris',
            url: 'https://aqicn.org/city/france/paris/avenue-des-champs-elysees',
          },
          dominentpol: 'pm10',
          iaqi: {
            co: { v: 0.1 },
            h: { v: 80.7 },
            no2: { v: 11.1 },
            p: { v: 992.5 },
            pm10: { v: 8 },
            pm25: { v: 13 },
            so2: { v: 0.6 },
            t: { v: 6.1 },
            w: { v: 1.5 },
            wg: { v: 7.2 },
          },
          time: {
            s: '2020-12-05 13:00:00',
            tz: '+01:00',
            v: 1607173200,
            iso: '2020-13-05T13:00:00+01:00',
          },
          forecast: {
            daily: {
              o2: [
                { avg: 19, day: '2020-12-05', max: 25, min: 13 },
                { avg: 7, day: '2020-12-06', max: 20, min: 2 },
                { avg: 3, day: '2020-12-07', max: 9, min: 1 },
                { avg: 4, day: '2020-12-08', max: 13, min: 1 },
                { avg: 4, day: '2020-12-09', max: 6, min: 4 },
              ],
              pm10: [
                { avg: 8, day: '2020-12-05', max: 13, min: 6 },
                { avg: 17, day: '2020-12-06', max: 24, min: 8 },
                { avg: 30, day: '2020-12-07', max: 33, min: 20 },
                { avg: 28, day: '2020-12-08', max: 32, min: 20 },
                { avg: 28, day: '2020-12-09', max: 28, min: 27 },
              ],
              pm25: [
                { avg: 26, day: '2020-12-05', max: 40, min: 15 },
                { avg: 52, day: '2020-12-06', max: 66, min: 24 },
                { avg: 85, day: '2020-12-07', max: 93, min: 67 },
                { avg: 76, day: '2020-12-08', max: 84, min: 66 },
                { avg: 80, day: '2020-12-09', max: 80, min: 78 },
              ],
              uvi: [
                { avg: 0, day: '2020-12-05', max: 0, min: 0 },
                { avg: 0, day: '2020-12-06', max: 0, min: 0 },
                { avg: 0, day: '2020-12-07', max: 0, min: 0 },
                { avg: 0, day: '2020-12-08', max: 0, min: 0 },
                { avg: 0, day: '2020-12-09', max: 1, min: 0 },
                { avg: 0, day: '2020-12-10', max: 0, min: 0 },
              ],
            },
          },
          debug: {
            sync: '2020-12-05T22:17:22+09:00',
          },
        },
      };
      await expect(validateApiResponse(response, station)).rejects.toThrowError(
        new Error(`Validation failed for WAQI API response for station with id 1.
Validation errors:

An instance of WaqiDataValidator has failed the validation:
 - property idx has failed the following constraints: isPositive 

An instance of WaqiDataValidator has failed the validation:
 - property attributions[0].url has failed the following constraints: isUrl 

An instance of WaqiDataValidator has failed the validation:
 - property time.iso has failed the following constraints: isIso8601 

An instance of WaqiDataValidator has failed the validation:
 - property forecast.daily has failed the following constraints: IsWaqiDailyForecastConstraint 

Full response: ${JSON.stringify(response)}`),
      );
    });
  });

  describe('insertDataInDb', () => {
    const mockRepository = mockRepositoryFactory();
    mockRepository.create.mockImplementation((instance) => instance);
    mockRepository.save.mockImplementation(() => Promise.resolve(null));

    afterEach(() => {
      mockRepository.save.mockClear();
    });

    const response: WaqiApiSuccess = {
      status: 'ok',
      data: {
        aqi: 20,
        idx: station.externalId,
        attributions: [{ url: 'http://www.airparif.asso.fr/', name: 'AirParif' }],
        city: {
          geo: [48.8686, 2.31166],
          name: 'Paris',
          url: 'https://aqicn.org/city/france/paris/avenue-des-champs-elysees',
        },
        dominentpol: 'pm10',
        iaqi: {
          co: { v: 0.1 },
          no2: { v: 11.1 },
        },
        time: {
          s: '2020-12-05 13:00:00',
          tz: '+01:00',
          v: 1607173200,
          iso: '2020-12-05T13:00:00+01:00',
        },
        forecast: {
          daily: {},
        },
        debug: {
          sync: '2020-12-05T22:17:22+09:00',
        },
      },
    };

    const keyObj = {
      aqi: pollutantAqi,
      co: pollutantCo,
      no2: pollutantNo2,
    };

    it('should save data correctly if the pollutant is found', async () => {
      await insertDataInDb(
        response,
        (mockRepository as unknown) as Repository<PollutantData>,
        station,
        keyObj,
        [],
      );
      expect(mockRepository.save).toHaveBeenCalledTimes(3);
      expect(mockRepository.save).toHaveBeenCalledWith({
        stationId: station.id,
        pollutantId: pollutantCo.id,
        datetime: '2020-12-05T13:00:00+01:00',
        value: 0.1,
      });
    });

    it('should throw an error if an unknown pollutant is found', async () => {
      const modifiedResponse: WaqiApiSuccess = {
        status: 'ok',
        data: {
          ...response.data,
          iaqi: {
            ...response.data.iaqi,
            fakePollutant: { v: 3 },
          },
        },
      };
      await expect(
        insertDataInDb(
          modifiedResponse,
          (mockRepository as unknown) as Repository<PollutantData>,
          station,
          keyObj,
          [],
        ),
      ).rejects.toThrowError(
        new Error(`Unknown pollutant "fakePollutant" received in WAQI API response.
Full response: ${JSON.stringify(modifiedResponse)}`),
      );
    });

    it('should not save the data if it has not been updated since last run', async () => {
      const consoleInfoCalls = [];
      const spy = jest.spyOn(global.console, 'info');
      spy.mockImplementation((data: any) => {
        consoleInfoCalls.push(data);
      });

      await insertDataInDb(
        response,
        (mockRepository as unknown) as Repository<PollutantData>,
        station,
        keyObj,
        [
          {
            stationId: station.id,
            datetime: '2020-12-05T13:00:00+01:00',
          },
        ],
      );
      expect(mockRepository.save).toHaveBeenCalledTimes(0);
      expect(consoleInfoCalls).toEqual([
        'Data already saved for station 1 at time 2020-12-05T13:00:00+01:00',
      ]);

      spy.mockRestore();
    });

    it('should not save the data if it is a previous data point', async () => {
      const modifiedResponse: WaqiApiSuccess = {
        status: 'ok',
        data: {
          ...response.data,
          time: {
            ...response.data.time,
            iso: '2020-12-05T11:00:00+01:00',
          },
        },
      };

      const consoleInfoCalls = [];
      const spy = jest.spyOn(global.console, 'info');
      spy.mockImplementation((data: any) => {
        consoleInfoCalls.push(data);
      });

      await insertDataInDb(
        modifiedResponse,
        (mockRepository as unknown) as Repository<PollutantData>,
        station,
        keyObj,
        [
          {
            stationId: station.id,
            datetime: '2020-12-05T13:00:00+01:00',
          },
          {
            stationId: station.id,
            datetime: '2020-12-05T11:00:00+01:00',
          },
        ],
      );
      expect(mockRepository.save).toHaveBeenCalledTimes(0);
      expect(consoleInfoCalls).toEqual([
        'Data already saved for station 1 at time 2020-12-05T11:00:00+01:00',
      ]);

      spy.mockRestore();
    });

    it('should not save the AQI if it is a string', async () => {
      const consoleInfoCalls = [];
      const spy = jest.spyOn(global.console, 'info');
      spy.mockImplementation((data: any) => {
        consoleInfoCalls.push(data);
      });

      const modifiedResponse: WaqiApiSuccess = {
        status: 'ok',
        data: {
          ...response.data,
          aqi: '-',
        },
      };

      await insertDataInDb(
        modifiedResponse,
        (mockRepository as unknown) as Repository<PollutantData>,
        station,
        keyObj,
        [],
      );
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
      expect(consoleInfoCalls).toEqual(['No AQI in API response for station 1.']);

      spy.mockRestore();
    });
  });
});
