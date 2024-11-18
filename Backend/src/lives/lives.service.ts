import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LiveEntity } from './entity/live.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';
import { UUID } from 'crypto';
import { ErrorMessage } from './error/error.message.enum';
import { ChatsService } from './../chats/chats.service';

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
  ) {}

  async readLives(options: ReadLivesOptions): Promise<LivesDto[]> {
    const { sort = 'latest', limit = 20, offset = 0, categoriesId, onAir } = options;

    const queryBuilder = this.livesRepository
      .createQueryBuilder('live')
      .leftJoinAndSelect('live.category', 'category')
      .leftJoinAndSelect('live.user', 'user');

    // 기본 onAir true 상태
    if (typeof onAir === 'boolean') {
      queryBuilder.andWhere('live.onAir = :onAir', { onAir });
    }

    // 카테고리 필터
    if (categoriesId) {
      queryBuilder.andWhere('live.categoriesId = :categoriesId', { categoriesId });
    }

    // 정렬 로직 추가
    if (sort === 'recommendation') {
      queryBuilder.orderBy('RAND()'); // 추천은 랜덤 정렬
    } else if (sort === 'viewers') {
      // viewers 정렬은 아직 구현 X
    } else {
      // 기본은 최신순
      queryBuilder.orderBy('live.createdAt', 'DESC');
    }

    // 페이지네이션 적용
    const lives = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    return lives.map((entity) => entity.toLivesDto());
  }

  async readLive(channelId: string): Promise<LiveDto> {
    const live = await this.livesRepository.findOne({ relations: ['category', 'user'], where: { channelId } });

    if (!live) {
      throw new NotFoundException(ErrorMessage.LIVE_NOT_FOUND);
    }

    return live.toLiveDto();
  }

  async updateLive({ channelId, updateLiveDto }) {
    // TODO 요청자와 채널 소유자 일치여부 체크(로그인 기능 구현 후)
    await this.livesRepository.update({ channelId }, updateLiveDto);
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
    this.chatsService.clearChat(channelId);
  }

  async readStreamingKey(livesId: number) {
    const live = await this.livesRepository.findOne({ where: { id: livesId } });
    return live.streamingKey;
  }
}
