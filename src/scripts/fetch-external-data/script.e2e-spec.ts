import { Connection, createConnection, Repository } from 'typeorm';
import connectionOptions from '../../../ormconfig';
import { Pollutant, PollutantData, Station } from '../../entities';
import { WaqiApiSuccess } from './waqi-api-response';
import { mocked } from 'ts-jest/utils';
import fetch, { Response } from 'node-fetch';
import { fetchExternalData } from './script';
import { truncateTables } from '../../util/truncate-tables';

jest.mock('node-fetch');
const mockedFetch = mocked(fetch);

const createMockResponse = (data: any): Promise<Response> =>
  Promise.resolve(({
    json() {
      return data;
    },
  } as unknown) as Response);

let connection: Connection;

describe('Fetch external data (E2E)', () => {
  let station1: Station;
  let station2: Station;
  let pollutantCo: Pollutant;
  let pollutantNo2: Pollutant;

  let pollutantDataRepository: Repository<PollutantData>;

  beforeAll(async () => {
    connection = await createConnection({
      ...connectionOptions,
      name: __filename,
    });
    await truncateTables(connection);

    const stationRepository = connection.getRepository(Station);
    const pollutantRepository = connection.getRepository(Pollutant);
    pollutantDataRepository = connection.getRepository(PollutantData);

    station1 = stationRepository.create({
      name: 'Paris',
      latitude: 48.8534,
      longitude: 2.3488,
      externalId: 1000,
    });

    station2 = stationRepository.create({
      name: 'Gif-sur-Yvette',
      latitude: 48.6833,
      longitude: 2.1333,
      externalId: 2000,
    });

    pollutantCo = pollutantRepository.create({
      shortName: 'CO',
      fullName: 'Carbon monoxide',
      description: 'A pollutant',
      waqiName: 'co',
    });

    pollutantNo2 = pollutantRepository.create({
      shortName: 'NO2',
      fullName: 'Nitrogen dioxide',
      description: 'A pollutant',
      waqiName: 'no2',
    });

    [station1, station2] = await stationRepository.save([station1, station2]);
    [pollutantCo, pollutantNo2] = await pollutantRepository.save([pollutantCo, pollutantNo2]);
  });

  describe('fetchExternalData', () => {
    test('should insert data in the database based on the API response', async () => {
      const responseStation1: WaqiApiSuccess = {
        status: 'ok',
        data: {
          aqi: 20,
          idx: station1.externalId,
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

      const responseStation2: WaqiApiSuccess = {
        status: 'ok',
        data: {
          aqi: 18,
          idx: station2.externalId,
          attributions: [{ url: 'http://www.airparif.asso.fr/', name: 'AirParif' }],
          city: {
            geo: [48.6833, 2.1333],
            name: 'Gif-sur-Yvette',
            url: 'https://aqicn.org/city/france/paris/gif-sur-yvette',
          },
          dominentpol: 'co',
          iaqi: {
            co: { v: 0.5 },
            no2: { v: 8.6 },
          },
          time: {
            s: '2020-12-05 13:00:00',
            tz: '+01:00',
            v: 1607173200,
            iso: '2020-12-05T14:00:00+01:00',
          },
          forecast: {
            daily: {},
          },
          debug: {
            sync: '2020-12-05T22:17:22+09:00',
          },
        },
      };

      mockedFetch.mockImplementation((url: string) => {
        const externalId = /\/@(\d+)\//.exec(url);
        if (externalId[1] === station1.externalId.toString()) {
          return createMockResponse(responseStation1);
        } else return createMockResponse(responseStation2);
      });

      await fetchExternalData();

      const pollutantData = await pollutantDataRepository.find({
        select: ['value', 'stationId', 'pollutantId', 'datetime'],
      });

      interface PartialPollutantData {
        stationId: number;
        pollutantId: number;
        datetime: string;
        value: number;
      }

      const compareFunc = (obj1: PartialPollutantData, obj2: PartialPollutantData): number => {
        if (obj1.stationId !== obj2.stationId) return obj1.stationId - obj2.stationId;
        if (obj1.pollutantId !== obj2.pollutantId) return obj1.pollutantId - obj2.pollutantId;
        if (obj1.datetime !== obj2.datetime) return obj1.datetime.localeCompare(obj2.datetime);
        return obj1.value - obj2.value;
      };

      expect(
        pollutantData.map((obj) => ({ ...obj } as PartialPollutantData)).sort(compareFunc),
      ).toEqual(
        [
          {
            stationId: station1.id,
            pollutantId: pollutantCo.id,
            value: 0.1,
            datetime: '2020-12-05T12:00:00.000Z',
          },
          {
            stationId: station1.id,
            pollutantId: pollutantNo2.id,
            value: 11.1,
            datetime: '2020-12-05T12:00:00.000Z',
          },
          {
            stationId: station2.id,
            pollutantId: pollutantCo.id,
            value: 0.5,
            datetime: '2020-12-05T13:00:00.000Z',
          },
          {
            stationId: station2.id,
            pollutantId: pollutantNo2.id,
            value: 8.6,
            datetime: '2020-12-05T13:00:00.000Z',
          },
        ].sort(compareFunc) as PartialPollutantData[],
      );
    });
  });

  afterAll(async () => {
    await connection.close();
  });
});
