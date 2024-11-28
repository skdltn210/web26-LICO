import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LiveEntity } from './entity/live.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';
import { UUID } from 'crypto';
import { ErrorMessage } from './error/error.message.enum';
import { ChatsService } from './../chats/chats.service';
import Redis from 'ioredis';
import { UpdateLiveDto } from './dto/update.live.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';

// 인터페이스 추가
export interface ReadLivesOptions {
  sort?: 'latest' | 'viewers' | 'recommendation';
  limit?: number;
  offset?: number;
  categoriesId?: number;
  onAir?: boolean;
}

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(LiveEntity) private livesRepository: Repository<LiveEntity>,
    private chatsService: ChatsService,
    @InjectRedis() private redisClient: Redis,
  ) {
    this.redisClient.flushall();
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

  async readLives(options: ReadLivesOptions): Promise<LivesDto[]> {
    const { sort = 'latest', limit = 20, offset = 0, categoriesId, onAir = true } = options;

    const queryBuilder = this.livesRepository
      .createQueryBuilder('live')
      .leftJoinAndSelect('live.category', 'category')
      .leftJoinAndSelect('live.user', 'user');

    if (typeof onAir === 'boolean') {
      queryBuilder.andWhere('live.onAir = :onAir', { onAir });
    }

    if (categoriesId) {
      queryBuilder.andWhere('live.categoriesId = :categoriesId', { categoriesId });
    }

    // 정렬 로직 추가
    if (sort === 'recommendation') {
      queryBuilder.orderBy('RAND()');
    } else if (sort === 'viewers') {
      queryBuilder.orderBy('live.viewers', 'DESC');
    } else {
      queryBuilder.orderBy('live.createdAt', 'DESC');
    }

    // 페이지네이션 적용
    const lives = await queryBuilder.skip(offset).take(limit).getMany();

    return lives.map(entity => entity.toLivesDto());
  }

  async readLive(channelId: string): Promise<LiveDto> {
    const live = await this.livesRepository.findOne({ relations: ['category', 'user'], where: { channelId } });

    if (!live) {
      throw new NotFoundException(ErrorMessage.LIVE_NOT_FOUND);
    }

    return live.toLiveDto();
  }

  async updateLive({
    channelId,
    updateLiveDto,
    userId,
  }: {
    channelId: UUID;
    updateLiveDto: UpdateLiveDto;
    userId: number;
  }) {
    const live = await this.livesRepository.findOne({
      where: { channelId },
      relations: ['user'],
    });

    if (!live) {
      throw new NotFoundException(ErrorMessage.LIVE_NOT_FOUND);
    }

    if (live.user.id !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    await this.livesRepository.update({ channelId }, updateLiveDto);
  }

  async updateViewers(channelId: UUID) {
    await this.livesRepository.update({ channelId }, { viewers: await this.chatsService.readViewers(channelId) });
  }

  async readChannelId(streamingKey: UUID) {
    const live = await this.livesRepository.findOne({ where: { streamingKey } });

    if (!live) {
      throw new NotFoundException(ErrorMessage.LIVE_NOT_FOUND);
    }

    return { channelId: live.channelId };
  }

  async startLive(streamingKey: UUID) {
    const live = await this.livesRepository.findOne({ where: { streamingKey } });

    if (live.onAir) {
      throw new ConflictException(ErrorMessage.LIVE_ALREADY_STARTED);
    }

    this.chatsService.clearChat(live.channelId as UUID);
    await this.livesRepository.update({ streamingKey }, { startedAt: new Date(), onAir: true, viewers: 0 });
  }

  async endLive(streamingKey: UUID) {
    this.livesRepository.update({ streamingKey }, { onAir: false });
  }

  async readStatus(channelId: UUID) {
    const redisKey = `${channelId}:status`;
    const cache = await this.redisClient.get(redisKey);
    if (cache) {
      return JSON.parse(cache);
    }

    const live = await this.livesRepository.findOne({ relations: ['category'], where: { channelId } });

    if (!live) {
      throw new NotFoundException(ErrorMessage.LIVE_NOT_FOUND);
    }

    const status = live.toStatus();
    await this.redisClient.set(redisKey, JSON.stringify(status), 'EX', 60);
    return status;
  }

  // 카테고리 통계
  async getCategoryStats(): Promise<{ categoriesId: number; liveCount: number; viewerCount: number }[]> {
    const stats = await this.livesRepository
      .createQueryBuilder('live')
      .select('live.categoriesId', 'categoriesId')
      .addSelect('COUNT(live.id)', 'liveCount')
      .addSelect('SUM(live.viewers)', 'viewerCount')
      .where('live.onAir = :onAir', { onAir: true })
      .groupBy('live.categoriesId')
      .getRawMany();

    return stats.map(stat => ({
      categoriesId: Number(stat.categoriesId),
      liveCount: Number(stat.liveCount),
      viewerCount: Number(stat.viewerCount) || 0,
    }));
  }

  async getCategoryStatsById(categoriesId: number): Promise<{ liveCount: number; viewerCount: number }> {
    const stats = await this.livesRepository
      .createQueryBuilder('live')
      .select('COUNT(live.id)', 'liveCount')
      .addSelect('SUM(live.viewers)', 'viewerCount')
      .where('live.onAir = :onAir', { onAir: true })
      .andWhere('live.categoriesId = :categoriesId', { categoriesId })
      .getRawOne();

    return {
      liveCount: Number(stats.liveCount) || 0,
      viewerCount: Number(stats.viewerCount) || 0,
    };
  }
}
