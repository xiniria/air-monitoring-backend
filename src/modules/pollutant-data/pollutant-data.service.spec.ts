import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { mockConnectionFactory, mockRepositoryFactory, MockType } from '../../util/mock-database';
import { Pollutant, PollutantData, Station } from '../../entities';
import { PollutantDataService } from './pollutant-data.service';
import * as dayjs from 'dayjs';

describe('PollutantDataService', () => {
  let service: PollutantDataService;
  let pollutantRepo: MockType<Repository<Pollutant>>;
  let pollutantDataRepo: MockType<Repository<PollutantData>>;
  let stationRepo: MockType<Repository<Station>>;
  let connection: MockType<Connection>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollutantDataService,
        { provide: getRepositoryToken(Pollutant), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(PollutantData), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(Station), useFactory: mockRepositoryFactory },
        { provide: Connection, useFactory: mockConnectionFactory },
      ],
    }).compile();

    connection = module.get(Connection);
    pollutantRepo = module.get(getRepositoryToken(Pollutant));
    pollutantDataRepo = module.get(getRepositoryToken(PollutantData));
    stationRepo = module.get(getRepositoryToken(Station));
    service = module.get<PollutantDataService>(PollutantDataService);
  });

  const now = dayjs().toISOString();
  const oneHourAgo = dayjs().subtract(1, 'hour').toISOString();
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
  const gif: Station = {
    id: 2,
    externalId: 2,
    name: 'Gif-sur-Yvette',
    latitude: 48.6964153,
    longitude: 2.0991891,
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
  const aqi: Pollutant = {
    id: 2,
    fullName: 'Air Quality Index',
    shortName: 'AQI',
    waqiName: 'aqi',
    description: '',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    isPollutant: true,
    unit: '',
  };
  const pollutantData: PollutantData = {
    id: 1,
    datetime: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    stationId: gif.id,
    station: gif,
    pollutantId: pollutant.id,
    pollutant,
    value: 1.4,
  };
  const aqiData: PollutantData = {
    id: 2,
    datetime: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    stationId: gif.id,
    station: gif,
    pollutantId: aqi.id,
    pollutant,
    value: 32,
  };
  const oldAqiData: PollutantData = {
    id: 2,
    datetime: oneHourAgo,
    createdAt: oneHourAgo,
    updatedAt: oneHourAgo,
    deletedAt: null,
    stationId: gif.id,
    station: gif,
    pollutantId: aqi.id,
    pollutant,
    value: 27,
  };

  describe('computeDistance', () => {
    it('should correctly compute the Brest-Nice distance', () => {
      expect(
        PollutantDataService.computeDistance(43.7032932, 7.1827771, 48.4085008, -4.5696404),
      ).toEqual(1045.3190503558722);
    });
  });

  describe('computeClosestStation', () => {
    it('should correctly return the closest station for Orsay (Gif-sur-Yvette)', () =>
      expect(
        PollutantDataService.computeClosestStation(48.6971724, 2.1545856, [paris, gif]),
      ).toEqual(gif.id));

    it('should correctly return the closest station for Vincennes (Paris)', () =>
      expect(
        PollutantDataService.computeClosestStation(48.8471383, 2.4294888, [paris, gif]),
      ).toEqual(paris.id));
  });

  describe('getClosestStationData', () => {
    it('should return a data point for the closest station for Orsay', async () => {
      stationRepo.find.mockImplementation(() => Promise.resolve([paris, gif]));
      connection.query.mockImplementation(() => Promise.resolve([{ latestTimestamp: now }]));
      pollutantDataRepo.find.mockImplementation(() => Promise.resolve([pollutantData, aqiData]));
      pollutantRepo.findOne.mockImplementation(() => Promise.resolve(aqi));

      await expect(service.getClosestStationData(48.6971724, 2.1545856)).resolves.toEqual([
        pollutantData,
        aqiData,
      ]);
    });

    it('should return an old AQI data if there is no recent one', async () => {
      stationRepo.find.mockImplementation(() => Promise.resolve([paris, gif]));
      connection.query.mockImplementation(() => Promise.resolve([{ latestTimestamp: now }]));
      pollutantDataRepo.find.mockImplementation(() => Promise.resolve([pollutantData]));
      pollutantDataRepo.findOne.mockImplementation(() => Promise.resolve(oldAqiData));
      pollutantRepo.findOne.mockImplementation(() => Promise.resolve(aqi));

      await expect(service.getClosestStationData(48.6971724, 2.1545856)).resolves.toEqual([
        pollutantData,
        oldAqiData,
      ]);
    });
  });
});
