import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Pollutant, PollutantData, Station } from '../../entities';
import dayjs from '../../util/dayjs';
import { PollutantsService } from '../pollutants/pollutants.service';

@Injectable()
export class PollutantDataService {
  constructor(
    @InjectRepository(Pollutant) private pollutantRepository: Repository<Pollutant>,
    @InjectRepository(PollutantData) private pollutantDataRepository: Repository<PollutantData>,
    @InjectRepository(Station) private stationRepository: Repository<Station>,
    private connection: Connection,
  ) {}

  private readonly logger = new Logger(PollutantsService.name);

  public async getClosestStationData(
    latitude: number,
    longitude: number,
  ): Promise<PollutantData[]> {
    const allStations = await this.stationRepository.find();
    const closestStationId = PollutantDataService.computeClosestStation(
      latitude,
      longitude,
      allStations,
      this.logger,
    );

    const latestTimestampRows = (await this.connection.query(`
SELECT max(datetime) AS "latestTimestamp"
FROM pollutant_data
WHERE station_id = ${closestStationId} AND NOT is_prediction;
    `)) as { latestTimestamp: string }[];
    const latestTimestamp = latestTimestampRows[0].latestTimestamp;

    const now = dayjs();
    const latestTimestampObj = dayjs(latestTimestamp);
    const age = now.diff(latestTimestampObj, 'hour');

    if (age > 6) {
      this.logger.warn(
        `Latest data for station with id ${closestStationId} is older than 6 hours (${age} hours)`,
      );
    }

    const data = await this.pollutantDataRepository.find({
      where: { datetime: latestTimestamp, stationId: closestStationId, isPrediction: false },
    });

    const aqiPollutant = await this.pollutantRepository.findOne({
      where: { shortName: 'AQI' },
    });

    // if there is no AQI in latest data, get the most recent value for this station
    if (!data.find((pollutantData) => pollutantData.pollutantId === aqiPollutant.id)) {
      const aqiData = await this.pollutantDataRepository.findOne({
        where: { stationId: closestStationId, pollutantId: aqiPollutant.id, isPrediction: false },
        order: { datetime: 'DESC' },
      });
      this.logger.warn(
        `No AQI in latest data (${latestTimestamp}) for station with id ${closestStationId}, ` +
          `using older AQI instead (timestamp: ${aqiData.datetime})`,
      );
      data.push(aqiData);
    }

    return data;
  }

  public static computeClosestStation(
    latitude: number,
    longitude: number,
    stations: Station[],
    logger?: Logger,
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

    // we cannot use PollutantDataService.logger here since this is a static method
    if (minDistance > 100 && logger) {
      logger.warn(
        `Closest station (id ${closestStationId}) is more than 100 km away (${Math.trunc(
          minDistance,
        )} km)`,
      );
    }

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
