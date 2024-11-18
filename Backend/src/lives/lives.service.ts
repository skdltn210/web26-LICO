import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LiveEntity } from './entity/live.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';
import { UUID } from 'crypto';
import { ErrorMessage } from './error/error.message.enum';
import { ChatsService } from './../chats/chats.service';
import Redis from 'ioredis';
import { UpdateLiveDto } from './dto/update.live.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(LiveEntity) private livesRepository: Repository<LiveEntity>,
    private chatsService: ChatsService,
    @InjectRedis() private redisClient: Redis,
  ) {
    this.redisClient.config('SET', 'notify-keyspace-events', 'Ex');

    const subscriber = this.redisClient.duplicate();
    subscriber.subscribe('__keyevent@0__:expired');

    subscriber.on('message', async (channel, key) => {
      const { channelId } = key.match(
        /(?<channelId>[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}):status/,
      ).groups;

      if (channelId) {
        this.updateViewers(channelId as UUID);
      }
    });
  }

  async readLives(where: FindOptionsWhere<LiveEntity> = {}): Promise<LivesDto[]> {
    // TODO 데이터 베이스 뷰 추가
    const lives = await this.livesRepository.find({
      relations: ['category', 'user'],
      where,
    });
    return lives.map(entity => entity.toLivesDto());
  }

  async readLive(channelId: string): Promise<LiveDto> {
    const live = await this.livesRepository.findOne({ relations: ['category', 'user'], where: { channelId } });

    if (!live) {
      throw new NotFoundException(ErrorMessage.LIVE_NOT_FOUND);
    }

    return live.toLiveDto();
  }

  async updateLive({ channelId, updateLiveDto }: { channelId: UUID; updateLiveDto: UpdateLiveDto }) {
    // TODO 요청자와 채널 소유자 일치여부 체크(로그인 기능 구현 후)
    await this.livesRepository.update({ channelId }, updateLiveDto);
  }

  async updateViewers(channelId: UUID) {
    await this.livesRepository.update({ channelId }, { viewers: await this.chatsService.readViewers(channelId) });
  }

  async readChannelId(streamingKey: UUID) {
    const live = await this.livesRepository.findOne({ where: { streamingKey } });
    return { channelId: live.channelId };
  }

  async startLive(streamingKey: UUID) {
    const live = await this.livesRepository.findOne({ where: { streamingKey } });

    if (live.onAir) {
      throw new ConflictException(ErrorMessage.LIVE_ALREADY_STARTED);
    }

    this.chatsService.clearChat(live.channelId as UUID);
    await this.livesRepository.update({ streamingKey }, { startedAt: new Date(), onAir: true });
  }

  async endLive(channelId: UUID) {
    this.livesRepository.update({ channelId }, { onAir: false });
  }

  async readStreamingKey(livesId: number) {
    const live = await this.livesRepository.findOne({ where: { id: livesId } });
    return live.streamingKey;
  }

  async readStatus(channelId: UUID) {
    const redisKey = `${channelId}:status`;
    const cache = await this.redisClient.get(redisKey);
    if (cache) {
      return JSON.parse(cache);
    }

    const live = await this.livesRepository.findOne({ where: { channelId } });

    if (!live) {
      throw new NotFoundException(ErrorMessage.LIVE_NOT_FOUND);
    }

    const status = live.toStatus();
    await this.redisClient.set(redisKey, JSON.stringify(status), 'EX', 60);
    return status;
  }
}
