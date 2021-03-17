import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import connectionOptions from '../../../ormconfig';
import { LoggerMiddleware } from '../../middlewares/logger';
import { PollutantDataModule } from '../pollutant-data/pollutant-data.module';
import { PollutantModule } from '../pollutants/pollutants.module';
import { PollutantHistoryModule } from '../pollutant-history/pollutant-history.module';
import { MapDataModule } from '../map-data/map-data.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(connectionOptions),
    PollutantDataModule,
    PollutantModule,
    PollutantHistoryModule,
    MapDataModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
