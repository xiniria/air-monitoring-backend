import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pollutant } from '../../entities';

@Injectable()
export class PollutantsService {
  constructor(@InjectRepository(Pollutant) private pollutantRepository: Repository<Pollutant>) {}

  public async getAllPollutants(): Promise<Pollutant[]> {
    return this.pollutantRepository.find();
  }
}
