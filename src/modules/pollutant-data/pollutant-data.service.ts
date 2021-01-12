import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { PollutantData, Station } from '../../entities';

@Injectable()
export class PollutantDataService {
  constructor(
    @InjectRepository(PollutantData) private pollutantDataRepository: Repository<PollutantData>,
    @InjectRepository(Station) private stationRepository: Repository<Station>,
    private connection: Connection,
  ) {}

  public async getClosestStationData(
    latitude: number,
    longitude: number,
  ): Promise<PollutantData[]> {
    const allStations = await this.stationRepository.find();
    const closestStationId = PollutantDataService.computeClosestStation(
      latitude,
      longitude,
      allStations,
    );

    const latestTimestampRows = (await this.connection.query(`
SELECT max(datetime) AS "latestTimestamp"
FROM pollutant_data
WHERE station_id = ${closestStationId};
    `)) as { latestTimestamp: string }[];
    const latestTimestamp = latestTimestampRows[0].latestTimestamp;

    return this.pollutantDataRepository.find({
      where: { datetime: latestTimestamp, stationId: closestStationId },
    });
  }

  public static computeClosestStation(
    latitude: number,
    longitude: number,
    stations: Station[],
  ): number {
    let minDistance = Infinity;
    let closestStationId = stations[0].id;

    stations.forEach((station) => {
      const distance = PollutantDataService.computeDistance(
        station.latitude,
        station.longitude,
        latitude,
        longitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestStationId = station.id;
      }
    });

    return closestStationId;
  }

  public static computeDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const earthRadius = 6371; // km
    const degToRad = Math.PI / 180;
    // Prettier has a weird way of formatting mathematical expressions
    const a =
      0.5 -
      Math.cos((lat2 - lat1) * degToRad) / 2 +
      (Math.cos(lat1 * degToRad) *
        Math.cos(lat2 * degToRad) *
        (1 - Math.cos((lon2 - lon1) * degToRad))) /
        2;

    return 2 * earthRadius * Math.asin(Math.sqrt(a));
  }
}
