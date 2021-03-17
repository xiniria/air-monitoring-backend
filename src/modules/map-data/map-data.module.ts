import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollutantData, Station } from '../../entities';
import { MapDataController } from './map-data.controller';
import { MapDataService } from './map-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([PollutantData, Station])],
  controllers: [MapDataController],
  providers: [MapDataService],
})
export class MapDataModule {}
