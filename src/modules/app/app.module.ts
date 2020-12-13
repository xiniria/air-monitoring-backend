import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import connectionOptions from '../../../ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(connectionOptions)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
