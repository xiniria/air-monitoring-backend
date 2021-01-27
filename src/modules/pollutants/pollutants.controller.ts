import { Controller, Get } from '@nestjs/common';
import { Pollutant } from '../../entities';
import { PollutantsService } from './pollutants.service';

@Controller('pollutants')
export class PollutantsController {
  constructor(private readonly pollutantsService: PollutantsService) {}

  @Get()
  public async getAllPollutants(): Promise<Pollutant[]> {
    return this.pollutantsService.getAllPollutants();
  }
}
