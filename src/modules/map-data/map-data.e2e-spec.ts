import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection, getConnection } from 'typeorm';
import * as request from 'supertest';
import * as dayjs from 'dayjs';
import { truncateTables } from '../../util/truncate-tables';
import { Pollutant, PollutantData, Station } from '../../entities';
import { AppModule } from '../app/app.module';
import { MapDataModule } from './map-data.module';

// Function to get equality between object of objects
function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const value1 = object1[key];
    const value2 = object2[key];
    if (key === 'data') {
      for (const dataIndex in value1) {
        if (!shallowEqual(value1[dataIndex], value2[dataIndex])) {
          return false;
        }
      }
    } else if (value1 != value2) {
      return false;
    }
  }

  return true;
}

describe('MapDataModule (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;

  let station1: Station;
  let station2: Station;

  let parisPollutantDataCoNew: PollutantData;
  let gifPollutantDataCo: PollutantData;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MapDataModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = await getConnection('default');
    await truncateTables(connection);

    const stationRepository = connection.getRepository(Station);
    const pollutantRepository = connection.getRepository(Pollutant);
    const pollutantDataRepository = connection.getRepository(PollutantData);

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

    const pollutantCo = pollutantRepository.create({
      shortName: 'CO',
      fullName: 'Carbon monoxide',
      description: 'A pollutant',
      waqiName: 'co',
    });

    const pollutantNo2 = pollutantRepository.create({
      shortName: 'NO2',
      fullName: 'Nitrogen dioxide',
      description: 'A pollutant',
      waqiName: 'no2',
    });

    await stationRepository.save([station1, station2]);
    await pollutantRepository.save([pollutantCo, pollutantNo2]);

    const oldTime = dayjs('2020-01-06T08:00:00Z').toISOString();
    const newTime = dayjs('2020-01-06T12:00:00Z').toISOString();

    const parisPollutantDataCoOld = pollutantDataRepository.create({
      pollutantId: pollutantCo.id,
      stationId: station1.id,
      datetime: oldTime,
      value: 1.2,
    });

    parisPollutantDataCoNew = pollutantDataRepository.create({
      pollutantId: pollutantCo.id,
      stationId: station1.id,
      datetime: newTime,
      value: 0.7,
    });

    gifPollutantDataCo = pollutantDataRepository.create({
      pollutantId: pollutantCo.id,
      stationId: station2.id,
      datetime: oldTime,
      value: 1,
    });

    [gifPollutantDataCo, parisPollutantDataCoNew] = await pollutantDataRepository.save([
      gifPollutantDataCo,
      parisPollutantDataCoNew,
      parisPollutantDataCoOld,
    ]);
  });

  it('should return a correct response on route /map-data (GET)', (done) => {
    const resultValidation = function (res) {
      const result = res.body;
      const expectedResult = [
        { ...station2, data: [gifPollutantDataCo] },
        { ...station1, data: [parisPollutantDataCoNew] },
      ];

      for (const index in result) {
        if (!shallowEqual(result[index], expectedResult[index])) {
          throw new Error(
            'Received: ' +
              JSON.stringify(result[index], null, '\t') +
              ', expected: ' +
              JSON.stringify(expectedResult[index], null, '\t'),
          );
        }
      }
    };

    return request(app.getHttpServer())
      .get('/map-data')
      .expect(200)
      .expect(resultValidation)
      .end(done);
  });

  afterAll(async () => {
    await connection.close();
  });
});
