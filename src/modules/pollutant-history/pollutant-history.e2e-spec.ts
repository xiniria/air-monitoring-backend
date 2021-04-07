import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, getConnection, Repository } from 'typeorm';
import { truncateTables } from '../../util/truncate-tables';
import { stripClassArr } from '../../util/strip-class';
import dayjs from '../../util/dayjs';
import { Pollutant, PollutantData, Station } from '../../entities';
import { AppModule } from '../app/app.module';
import { PollutantHistoryModule } from './pollutant-history.module';

describe('PollutantHistoryModule (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;

  let pollutantNo2: Pollutant;
  let station1: Station;
  let pollutantDataCoOld: PollutantData;
  let pollutantDataNo2Old: PollutantData;
  let pollutantDataCoNew: PollutantData;
  let pollutantDataNo2New: PollutantData;

  let pollutantDataRepository: Repository<PollutantData>;

  const veryOldTime = dayjs('2020-01-06T00:00:00Z').toISOString();
  const oldTime = dayjs('2020-01-06T08:00:00Z').toISOString();
  const newTime = dayjs('2020-01-06T12:00:00Z').toISOString();
  const tonight = dayjs('2020-01-06T18:00:00Z').toISOString();

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
    pollutantDataRepository = connection.getRepository(PollutantData);

    station1 = stationRepository.create({
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

    pollutantNo2 = pollutantRepository.create({
      shortName: 'NO2',
      fullName: 'Nitrogen dioxide',
      description: 'A pollutant',
      waqiName: 'no2',
    });

    await stationRepository.save([station1, station2]);
    await pollutantRepository.save([pollutantCo, pollutantNo2]);

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

  describe('without predictions: route /pollutant-history/:latitude/:longitude (GET)', () => {
    it('should return a correct response if there are no predictions', (done) => {
      return request(app.getHttpServer())
        .get('/pollutant-history/48.8471383/2.4294888')
        .expect(200)
        .expect(
          stripClassArr([
            pollutantDataCoNew,
            pollutantDataNo2New,
            pollutantDataCoOld,
            pollutantDataNo2Old,
          ]),
        )
        .end(done);
    });
  });

  describe('with predictions: route /pollutant-history/:latitude/:longitude (GET)', () => {
    beforeAll(async () => {
      const pollutantDataNo2PredictionOld = pollutantDataRepository.create({
        pollutantId: pollutantNo2.id,
        stationId: station1.id,
        datetime: veryOldTime,
        value: 2.5,
        isPrediction: true,
        predictionDatetime: oldTime,
      });

      await pollutantDataRepository.save([pollutantDataNo2PredictionOld]);
    });

    it('should not return any predictions if all of them are before the latest data', () => {
      return request(app.getHttpServer())
        .get('/pollutant-history/48.8471383/2.4294888')
        .expect(200)
        .expect(
          stripClassArr([
            pollutantDataCoNew,
            pollutantDataNo2New,
            pollutantDataCoOld,
            pollutantDataNo2Old,
          ]),
        );
    });

    it('should return only predictions that are after the latest data', async () => {
      let pollutantDataNo2Prediction = pollutantDataRepository.create({
        pollutantId: pollutantNo2.id,
        stationId: station1.id,
        datetime: newTime,
        value: 2.3,
        isPrediction: true,
        predictionDatetime: tonight,
      });

      [pollutantDataNo2Prediction] = await pollutantDataRepository.save([
        pollutantDataNo2Prediction,
      ]);

      await request(app.getHttpServer())
        .get('/pollutant-history/48.8471383/2.4294888')
        .expect(200)
        .expect(
          stripClassArr([
            pollutantDataCoNew,
            pollutantDataNo2New,
            pollutantDataCoOld,
            pollutantDataNo2Old,
            pollutantDataNo2Prediction,
          ]),
        );
    }, 10000);
  });

  afterAll(async () => {
    await connection.close();
  });
});
