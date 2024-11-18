import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class ChatsService {
  constructor(@InjectRedis() private redisClient: Redis) {}

  async readViewers(channelId: UUID) {
    return await this.redisClient.hlen(`${channelId}:viewers`);
  }

  async clearChat(channelId: UUID) {
    this.redisClient.del(`${channelId}:chats`);
  }
}
