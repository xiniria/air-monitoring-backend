import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { mockConnectionFactory, mockRepositoryFactory, MockType } from '../../util/mock-database';
import dayjs from '../../util/dayjs';
import { Pollutant, PollutantData, Station } from '../../entities';
import { PollutantHistoryService } from './pollutant-history.service';

describe('PollutantHistoryService', () => {
  let service: PollutantHistoryService;
  let pollutantDataRepo: MockType<Repository<PollutantData>>;
  let stationRepo: MockType<Repository<Station>>;
  let connection: MockType<Connection>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollutantHistoryService,
        { provide: getRepositoryToken(PollutantData), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(Station), useFactory: mockRepositoryFactory },
        { provide: Connection, useFactory: mockConnectionFactory },
      ],
    }).compile();

    connection = module.get(Connection);
    pollutantDataRepo = module.get(getRepositoryToken(PollutantData));
    stationRepo = module.get(getRepositoryToken(Station));
    service = module.get<PollutantHistoryService>(PollutantHistoryService);
  });

  const newestDate = dayjs('2021-02-25T08:00:00Z').toISOString();
  const intermediateDate = dayjs('2021-02-24T16:00:00Z').toISOString();
  const oldestDate = dayjs('2021-02-24T11:00:00Z').toISOString();

  const paris: Station = {
    id: 1,
    externalId: 1,
    name: 'Paris',
    latitude: 48.8589507,
    longitude: 2.2770202,
    createdAt: oldestDate,
    updatedAt: oldestDate,
    deletedAt: null,
  };
  const gif: Station = {
    id: 2,
    externalId: 2,
    name: 'Gif-sur-Yvette',
    latitude: 48.6964153,
    longitude: 2.0991891,
    createdAt: oldestDate,
    updatedAt: oldestDate,
    deletedAt: null,
  };
  const pollutant: Pollutant = {
    id: 1,
    fullName: 'Carbon monoxide',
    shortName: 'CO',
    waqiName: 'co',
    description: 'A very bad pollutant',
    createdAt: oldestDate,
    updatedAt: oldestDate,
    deletedAt: null,
    isPollutant: true,
    unit: 'µg/m³',
  };
  const pollutantData: PollutantData = {
    id: 1,
    datetime: intermediateDate,
    createdAt: intermediateDate,
    updatedAt: intermediateDate,
    deletedAt: null,
    stationId: gif.id,
    station: gif,
    pollutantId: pollutant.id,
    pollutant,
    value: 1.4,
  };
  const pollutantDataNewest: PollutantData = {
    id: 1,
    datetime: newestDate,
    createdAt: newestDate,
    updatedAt: newestDate,
    deletedAt: null,
    stationId: gif.id,
    station: gif,
    pollutantId: pollutant.id,
    pollutant,
    value: 1.4,
  };
  const pollutantDataOldest: PollutantData = {
    id: 1,
    datetime: oldestDate,
    createdAt: oldestDate,
    updatedAt: oldestDate,
    deletedAt: null,
    stationId: gif.id,
    station: gif,
    pollutantId: pollutant.id,
    pollutant,
    value: 1.4,
  };

  describe('getClosestStationHistory', () => {
    it('should return a data point for the closest station for Orsay', async () => {
      stationRepo.find.mockImplementation(() => Promise.resolve([paris, gif]));
      connection.query.mockImplementation(() => Promise.resolve([]));
      pollutantDataRepo.find.mockImplementation(() =>
        Promise.resolve([pollutantDataNewest, pollutantData, pollutantDataOldest]),
      );

      await expect(service.getClosestStationHistory(48.6971724, 2.1545856)).resolves.toEqual([
        pollutantDataNewest,
        pollutantData,
        pollutantDataOldest,
      ]);
    });
  });
});
