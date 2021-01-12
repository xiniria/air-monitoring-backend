import { Controller, Get, Param } from '@nestjs/common';
import { PollutantData } from '../../entities';
import { ParseFloatPipe } from '../../pipes/parse-float.pipe';
import { PollutantDataService } from './pollutant-data.service';

@Controller('pollutant-data')
export class PollutantDataController {
  constructor(private readonly pollutantDataService: PollutantDataService) {}

  @Get(':latitude/:longitude')
  public async getClosestStationData(
    @Param('latitude', ParseFloatPipe) latitude: number,
    @Param('longitude', ParseFloatPipe) longitude: number,
  ): Promise<PollutantData[]> {
    return this.pollutantDataService.getClosestStationData(latitude, longitude);
  }
}
