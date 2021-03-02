import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import connectionOptions from '../../../ormconfig';
import { PollutantDataModule } from '../pollutant-data/pollutant-data.module';
import { PollutantModule } from '../pollutants/pollutants.module';
import { PollutantHistoryModule } from '../pollutant-history/pollutant-history.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(connectionOptions),
    PollutantDataModule,
    PollutantModule,
    PollutantHistoryModule,
  ],
})
export class AppModule {}
