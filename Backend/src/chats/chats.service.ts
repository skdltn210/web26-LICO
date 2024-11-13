import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class ChatsService {
  constructor(@Inject('Redis') private redisClient: Redis) {}

  async readViewers(channelId) {
    return await this.redisClient.get(`/chats/{channelId}:viewers`);
  }
}
