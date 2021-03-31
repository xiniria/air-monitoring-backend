import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { mockConnectionFactory, mockRepositoryFactory, MockType } from '../../util/mock-database';
import dayjs from '../../util/dayjs';
import { Pollutant, PollutantData, Station } from '../../entities';
import { MapDataService } from './map-data.service';

describe('MapDataService', () => {
  let service: MapDataService;
  let stationRepo: MockType<Repository<Station>>;
  let pollutantDataRepo: MockType<Repository<PollutantData>>;
  let connection: MockType<Connection>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapDataService,
        { provide: getRepositoryToken(PollutantData), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(Station), useFactory: mockRepositoryFactory },
        { provide: Connection, useFactory: mockConnectionFactory },
      ],
    }).compile();

    connection = module.get(Connection);
    stationRepo = module.get(getRepositoryToken(Station));
    pollutantDataRepo = module.get(getRepositoryToken(PollutantData));
    service = module.get<MapDataService>(MapDataService);
  });

  const now = dayjs().toISOString();
  const paris: Station = {
    id: 1,
    externalId: 1,
    name: 'Paris',
    latitude: 48.8589507,
    longitude: 2.2770202,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const pollutant: Pollutant = {
    id: 1,
    fullName: 'Carbon monoxide',
    shortName: 'CO',
    waqiName: 'co',
    description: 'A very bad pollutant',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    isPollutant: true,
    unit: 'µg/m³',
  };

  const parisPollutantData = {
    id: 2,
    datetime: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    stationId: paris.id,
    pollutantId: pollutant.id,
    value: 2,
  };

  describe('getMapData', () => {
    it('should return data for all the stations', async () => {
      stationRepo.find.mockImplementation(() => Promise.resolve([paris]));
      connection.query.mockImplementation(() =>
        Promise.resolve([{ latestTimestamp: parisPollutantData.datetime, stationId: paris.id }]),
      );
      pollutantDataRepo.find.mockImplementation(() => Promise.resolve([parisPollutantData]));

      const result = await service.getMapData();
      expect(result[0]).toMatchObject(paris);
      expect(result[0].data[0]).toEqual(parisPollutantData);
    });
  });
});
