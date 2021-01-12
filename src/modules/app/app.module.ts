import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import connectionOptions from '../../../ormconfig';
import { PollutantDataModule } from '../pollutant-data/pollutant-data.module';

@Module({
  imports: [TypeOrmModule.forRoot(connectionOptions), PollutantDataModule],
})
export class AppModule {}
