import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { mockConnectionFactory, mockRepositoryFactory, MockType } from '../../util/mock-database';
import { Pollutant } from '../../entities';
import { PollutantsService } from './pollutants.service';

describe('PollutantsService', () => {
  let service: PollutantsService;
  let pollutantRepo: MockType<Repository<Pollutant>>;
  let connection: MockType<Connection>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollutantsService,
        { provide: getRepositoryToken(Pollutant), useFactory: mockRepositoryFactory },
        { provide: Connection, useFactory: mockConnectionFactory },
      ],
    }).compile();

    connection = module.get(Connection);
    pollutantRepo = module.get(getRepositoryToken(Pollutant));
    service = module.get<PollutantsService>(PollutantsService);
  });

  const now = new Date().toISOString();
  const pollutantCo: Pollutant = {
    id: 1,
    fullName: 'Carbon monoxide',
    shortName: 'CO',
    waqiName: 'co',
    description: 'A very bad pollutant',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const pollutantNo2: Pollutant = {
    id: 2,
    fullName: 'Nitrogen dioxide',
    shortName: 'NO2',
    waqiName: 'no2',
    description: 'A moderately bad pollutant',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  describe('getAllPollutants', () => {
    it('should return all the pollutants and their information', async () => {
      pollutantRepo.find.mockImplementation(() => Promise.resolve([pollutantCo, pollutantNo2]));
      connection.query.mockImplementation(() => Promise.resolve([{ latestTimestamp: now }]));

      await expect(service.getAllPollutants()).resolves.toEqual([pollutantCo, pollutantNo2]);
    });
  });
});
