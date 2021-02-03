import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, getConnection } from 'typeorm';
import { truncateTables } from '../../util/truncate-tables';
import { Pollutant } from '../../entities';
import { AppModule } from '../app/app.module';
import { PollutantModule } from './pollutants.module';

describe('PollutantDataModule (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;

  let pollutantCo: Pollutant;
  let pollutantNo2: Pollutant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PollutantModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = await getConnection('default');
    await truncateTables(connection);

    const pollutantRepository = connection.getRepository(Pollutant);

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

    [pollutantCo, pollutantNo2] = await pollutantRepository.save([pollutantCo, pollutantNo2]);
  });

  it('should return a correct response on route /pollutants/ (GET)', (done) => {
    return request(app.getHttpServer())
      .get('/pollutants')
      .expect(200)
      .expect([pollutantCo, pollutantNo2].map((obj) => ({ ...obj }))) // strip the objects of their class
      .end(done);
  });

  afterAll(async () => {
    await connection.close();
  });
});
