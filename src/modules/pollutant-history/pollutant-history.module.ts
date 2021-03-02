import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollutantData, Station } from '../../entities';
import { PollutantHistoryController } from './pollutant-history.controller';
import { PollutantHistoryService } from './pollutant-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([PollutantData, Station])],
  controllers: [PollutantHistoryController],
  providers: [PollutantHistoryService],
})
export class PollutantHistoryModule {}
