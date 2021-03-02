import { Controller, Get, Param } from '@nestjs/common';
import { PollutantData } from '../../entities';
import { ParseFloatPipe } from '../../pipes/parse-float.pipe';
import { PollutantHistoryService } from './pollutant-history.service';

@Controller('pollutant-history')
export class PollutantHistoryController {
  constructor(private readonly pollutantHistoryService: PollutantHistoryService) {}

  @Get(':latitude/:longitude')
  public async getClosestStationHistory(
    @Param('latitude', ParseFloatPipe) latitude: number,
    @Param('longitude', ParseFloatPipe) longitude: number,
  ): Promise<PollutantData[]> {
    return this.pollutantHistoryService.getClosestStationHistory(latitude, longitude);
  }
}
