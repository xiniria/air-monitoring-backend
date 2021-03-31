import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, getConnection, Repository } from 'typeorm';
import { truncateTables } from '../../util/truncate-tables';
import { stripClassArr } from '../../util/strip-class';
import dayjs from '../../util/dayjs';
import { Pollutant, PollutantData, Station } from '../../entities';
import { AppModule } from '../app/app.module';
import { PollutantDataModule } from './pollutant-data.module';

describe('PollutantDataModule (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;

  let pollutantDataCoNew: PollutantData;
  let pollutantDataNo2New: PollutantData;
  let pollutantDataAqiOld: PollutantData;
  let pollutantDataAqiNew: PollutantData;
  let pollutantDataRepository: Repository<PollutantData>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PollutantDataModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = await getConnection('default');
    await truncateTables(connection);

    const stationRepository = connection.getRepository(Station);
    const pollutantRepository = connection.getRepository(Pollutant);
    pollutantDataRepository = connection.getRepository(PollutantData);

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

    const pollutantAqi = pollutantRepository.create({
      shortName: 'AQI',
      fullName: 'Air Quality Index',
      description: '',
      waqiName: 'aqi',
    });

    await stationRepository.save([station1, station2]);
    await pollutantRepository.save([pollutantCo, pollutantNo2, pollutantAqi]);

    const oldTime = dayjs('2020-01-06T08:00:00Z').toISOString();
    const newTime = dayjs('2020-01-06T12:00:00Z').toISOString();

    const pollutantDataCoOld = pollutantDataRepository.create({
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

    const pollutantDataNo2Old = pollutantDataRepository.create({
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

    pollutantDataAqiOld = pollutantDataRepository.create({
      pollutantId: pollutantAqi.id,
      stationId: station1.id,
      datetime: oldTime,
      value: 21,
    });

    pollutantDataAqiNew = pollutantDataRepository.create({
      pollutantId: pollutantAqi.id,
      stationId: station1.id,
      datetime: newTime,
      value: 46,
    });

    [
      pollutantDataCoNew,
      pollutantDataNo2New,
      pollutantDataAqiOld,
      pollutantDataAqiNew,
    ] = await pollutantDataRepository.save([
      pollutantDataCoNew,
      pollutantDataNo2New,
      pollutantDataAqiOld,
      pollutantDataAqiNew,
      pollutantDataCoOld,
      pollutantDataNo2Old,
    ]);
  });

  it('should return a correct response on route /pollutant-data/:latitude/:longitude (GET)', (done) => {
    return request(app.getHttpServer())
      .get('/pollutant-data/48.8471383/2.4294888')
      .expect(200)
      .expect(stripClassArr([pollutantDataCoNew, pollutantDataNo2New, pollutantDataAqiNew]))
      .end(done);
  });

  it('should get an older value for AQI if there is no recent one', async () => {
    await pollutantDataRepository.softDelete(pollutantDataAqiNew.id);

    await request(app.getHttpServer())
      .get('/pollutant-data/48.8471383/2.4294888')
      .expect(200)
      .expect(stripClassArr([pollutantDataCoNew, pollutantDataNo2New, pollutantDataAqiOld]));

    return pollutantDataRepository.restore(pollutantDataAqiNew.id);
  }, 10000);

  afterAll(async () => {
    await connection.close();
  });
});
