import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { PollutantData, Station } from '../../entities';

@Injectable()
export class MapDataService {
  constructor(
    @InjectRepository(PollutantData) private pollutantDataRepository: Repository<PollutantData>,
    @InjectRepository(Station) private stationRepository: Repository<Station>,
    private connection: Connection,
  ) {}

  public async getMapData(): Promise<MapData[]> {
    const stations: Station[] = await this.stationRepository.find();
    const mapData: MapData[] = [];

    // Most recent pollutant data for all stations
    const latestTimestamps: { latestTimestamp: string; stationId: number }[] = await this.connection
      .query(`
SELECT max(datetime) AS "latestTimestamp", station_id AS "stationId"
FROM pollutant_data
WHERE NOT is_prediction
GROUP BY station_id;
    `);
    const stationIds = latestTimestamps.map(({ stationId }) => stationId);

    const pollutantDataWhere = latestTimestamps.map(({ latestTimestamp, stationId }) => ({
      datetime: latestTimestamp,
      stationId,
      isPrediction: false,
    }));

    const allData = await this.pollutantDataRepository.find({
      where: pollutantDataWhere,
    });

    const dataByStation: { [stationId: number]: PollutantData[] } = {};
    let stationId: number;
    for (const entry of allData) {
      stationId = entry.stationId;
      if (dataByStation[stationId]) {
        dataByStation[stationId].push(entry);
      } else {
        dataByStation[stationId] = [entry];
      }
    }

    // Get station object from stationId and add data to mapData
    for (const stationId of stationIds) {
      const station = stations.find((element) => element.id === stationId);
      mapData.push({
        ...station,
        data: dataByStation[stationId],
      });
    }

    return mapData;
  }
}

export interface MapData extends Station {
  data: PollutantData[];
}
