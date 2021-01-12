import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollutantData, Station } from '../../entities';
import { PollutantDataController } from './pollutant-data.controller';
import { PollutantDataService } from './pollutant-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([PollutantData, Station])],
  controllers: [PollutantDataController],
  providers: [PollutantDataService],
})
export class PollutantDataModule {}
