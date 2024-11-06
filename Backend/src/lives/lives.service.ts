import { Injectable } from '@nestjs/common';
import { LiveEntity } from './entity/live.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivesDto } from './dto/lives.dto';

@Injectable()
export class LivesService {
  constructor(@InjectRepository(LiveEntity) private livesRepository: Repository<LiveEntity>) {}

  async readLives(): Promise<LivesDto[]> {
    const lives = await this.livesRepository.find({ relations: ['category'] });
    return lives.map(entity => entity.toLivesDto());
  }
}
