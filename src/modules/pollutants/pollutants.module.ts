import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pollutant } from '../../entities';
import { PollutantsController } from './pollutants.controller';
import { PollutantsService } from './pollutants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pollutant])],
  controllers: [PollutantsController],
  providers: [PollutantsService],
})
export class PollutantModule {}
