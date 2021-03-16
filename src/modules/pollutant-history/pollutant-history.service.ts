import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollutantData, Station } from '../../entities';
import { PollutantDataService } from '../pollutant-data/pollutant-data.service';

@Injectable()
export class PollutantHistoryService {
  constructor(
    @InjectRepository(PollutantData) private pollutantDataRepository: Repository<PollutantData>,
    @InjectRepository(Station) private stationRepository: Repository<Station>,
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

    return this.pollutantDataRepository.find({
      where: { stationId: closestStationId },
      order: { datetime: 'DESC', id: 'ASC' },
      take: 500,
    });
  }
}
