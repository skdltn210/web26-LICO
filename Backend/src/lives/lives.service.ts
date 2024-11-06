import { Injectable } from '@nestjs/common';
import { LiveEntity } from './entity/live.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';

@Injectable()
export class LivesService {
  constructor(@InjectRepository(LiveEntity) private livesRepository: Repository<LiveEntity>) {}

  async readLives(): Promise<LivesDto[]> {
    const lives = await this.livesRepository.find({ relations: ['category', 'user'] });
    return lives.map(entity => entity.toLivesDto());
  }

  async readLive(channelId: string): Promise<LiveDto> {
    // TODO 라이브 테이블에 채널아이디로 인덱스 추가
    const live = await this.livesRepository.findOne({ relations: ['category', 'user'], where: { channelId } });
    return live.toLiveDto();
  }
}
