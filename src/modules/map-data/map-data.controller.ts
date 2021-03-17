import { Controller, Get } from '@nestjs/common';
import { MapDataService } from './map-data.service';
import { MapData } from './map-data.service';

@Controller('map-data')
export class MapDataController {
  constructor(private readonly MapDataService: MapDataService) {}

  @Get()
  public async getMapData(): Promise<MapData[]> {
    return this.MapDataService.getMapData();
  }
}
