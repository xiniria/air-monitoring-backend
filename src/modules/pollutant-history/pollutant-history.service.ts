import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, MoreThan, Repository } from 'typeorm';
import { PollutantData, Station } from '../../entities';
import { PollutantDataService } from '../pollutant-data/pollutant-data.service';
import * as dayjs from 'dayjs';

@Injectable()
export class PollutantHistoryService {
  constructor(
    @InjectRepository(PollutantData) private pollutantDataRepository: Repository<PollutantData>,
    @InjectRepository(Station) private stationRepository: Repository<Station>,
    private connection: Connection,
  ) {}

  private readonly logger = new Logger(PollutantHistoryService.name);

  public async getClosestStationHistory(
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

    const pollutantData = await this.pollutantDataRepository.find({
      where: { stationId: closestStationId, isPrediction: false },
      order: { datetime: 'DESC', id: 'ASC' },
      take: 500,
    });

    const latestPredictionRows = (await this.connection.query(`
SELECT max(prediction_datetime) AS "latestTimestamp"
FROM pollutant_data
WHERE station_id = ${closestStationId} AND is_prediction;
    `)) as { latestTimestamp: string }[];

    if (latestPredictionRows.length === 0 || latestPredictionRows[0].latestTimestamp === null) {
      this.logger.warn(`No predictions in database for station with id ${closestStationId}`);
      return pollutantData;
    }
    const latestPredictionTimestamp = latestPredictionRows[0].latestTimestamp;

    let latestDataTimestamp = '2000-01-01T00:00:01.000Z';
    pollutantData.forEach((data) => {
      if (data.datetime > latestDataTimestamp) {
        latestDataTimestamp = data.datetime;
      }
    });

    if (dayjs(latestPredictionTimestamp).isBefore(dayjs(latestDataTimestamp))) {
      this.logger.warn(
        `Latest predictions for station with id ${closestStationId} are outdated: ` +
          `${latestPredictionTimestamp} is before latest data (${latestDataTimestamp})`,
      );
      return pollutantData;
    }

    // fetch the datetime matching the latest prediction
    // that way, if there are several predictions for the same predictionDatetime,
    // we only fetch the latest one (in terms of datetime)
    const { datetime } = (
      await this.pollutantDataRepository.find({
        select: ['datetime'],
        where: {
          stationId: closestStationId,
          isPrediction: true,
          predictionDatetime: latestPredictionTimestamp,
        },
        order: { datetime: 'DESC' },
      })
    )[0];
    const predictions = await this.pollutantDataRepository.find({
      where: {
        stationId: closestStationId,
        isPrediction: true,
        datetime,
        predictionDatetime: MoreThan(latestDataTimestamp),
      },
    });
    return [...pollutantData, ...predictions];
  }
}
