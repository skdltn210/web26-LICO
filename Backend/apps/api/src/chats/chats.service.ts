import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class ChatsService {
  constructor(@InjectRedis() private redisClient: Redis) {}

  async publishChat({
    channelId,
    message,
    userId,
    nickname,
  }: {
    channelId;
    message: string;
    userId: number;
    nickname: string;
  }) {
    const chat = JSON.stringify({ content: message, userId, nickname, timestamp: new Date() });
    await this.redisClient.multi().publish(`${channelId}:chat`, chat).rpush(`${channelId}:chats`, chat).exec();
  }

  async readViewers(channelId: UUID) {
    return await this.redisClient.hlen(`${channelId}:viewers`);
  }

  async clearChat(channelId: UUID) {
    this.redisClient.del(`${channelId}:chats`);
  }
}
