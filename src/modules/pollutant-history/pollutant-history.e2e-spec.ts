import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, getConnection } from 'typeorm';
import * as dayjs from 'dayjs';
import { truncateTables } from '../../util/truncate-tables';
import { Pollutant, PollutantData, Station } from '../../entities';
import { AppModule } from '../app/app.module';
import { PollutantHistoryModule } from './pollutant-history.module';

describe('PollutantHistoryModule (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;

  let pollutantDataCoOld: PollutantData;
  let pollutantDataNo2Old: PollutantData;
  let pollutantDataCoNew: PollutantData;
  let pollutantDataNo2New: PollutantData;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PollutantHistoryModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = await getConnection('default');
    await truncateTables(connection);

    const stationRepository = connection.getRepository(Station);
    const pollutantRepository = connection.getRepository(Pollutant);
    const pollutantDataRepository = connection.getRepository(PollutantData);

    const station1 = stationRepository.create({
      name: 'Paris',
      latitude: 48.8534,
      longitude: 2.3488,
      externalId: 1000,
    });

    const station2 = stationRepository.create({
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

    pollutantDataCoOld = pollutantDataRepository.create({
      pollutantId: pollutantCo.id,
      stationId: station1.id,
      datetime: oldTime,
      value: 1.2,
    });

    pollutantDataCoNew = pollutantDataRepository.create({
      pollutantId: pollutantCo.id,
      stationId: station1.id,
      datetime: newTime,
      value: 0.7,
    });

    pollutantDataNo2Old = pollutantDataRepository.create({
      pollutantId: pollutantNo2.id,
      stationId: station1.id,
      datetime: oldTime,
      value: 5.6,
    });

    pollutantDataNo2New = pollutantDataRepository.create({
      pollutantId: pollutantNo2.id,
      stationId: station1.id,
      datetime: newTime,
      value: 2.3,
    });

    [pollutantDataCoNew, pollutantDataNo2New] = await pollutantDataRepository.save([
      pollutantDataCoNew,
      pollutantDataNo2New,
      pollutantDataCoOld,
      pollutantDataNo2Old,
    ]);
  });

  it('should return a correct response on route /pollutant-history/:latitude/:longitude (GET)', (done) => {
    return request(app.getHttpServer())
      .get('/pollutant-history/48.8471383/2.4294888')
      .expect(200)
      .expect(
        [
          pollutantDataCoNew,
          pollutantDataNo2New,
          pollutantDataCoOld,
          pollutantDataNo2Old,
        ].map((obj) => ({ ...obj })),
      ) // strip the objects of their class
      .end(done);
  });

  afterAll(async () => {
    await connection.close();
  });
});
