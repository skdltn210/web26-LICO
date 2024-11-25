import { InjectRedis } from '@nestjs-modules/ioredis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UUID } from 'crypto';
import Redis from 'ioredis';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

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
    const filteringResult = await this.clovaFiltering(message);
    const chat = JSON.stringify({ content: message, userId, nickname, timestamp: new Date(), filteringResult });
    await this.redisClient.multi().publish(`${channelId}:chat`, chat).rpush(`${channelId}:chats`, chat).exec();
  }

  async readViewers(channelId: UUID) {
    return await this.redisClient.hlen(`${channelId}:viewers`);
  }

  async clearChat(channelId: UUID) {
    this.redisClient.del(`${channelId}:chats`);
  }

  async clovaFiltering(message: string) {
    const postData = {
      messages: [
        {
          role: 'system',
          content: this.configService.get<string>('CLOVA_CHAT_FILTERING_SYSTEM_PROMPT'),
        },
        {
          role: 'user',
          content: message,
        },
      ],
    };
    const { data } = await firstValueFrom(
      this.httpService.post(this.configService.get<string>('CLOVA_API_URL'), postData, {
        headers: {
          'X-NCP-CLOVASTUDIO-API-KEY': this.configService.get<string>('CLOVA_API_KEY'),
          'X-NCP-APIGW-API-KEY': this.configService.get<string>('CLOVA_API_GATEWAY_KEY'),
          'X-NCP-CLOVASTUDIO-REQUEST-ID': this.configService.get<string>('CLOVA_REQUEST_ID'),
        },
      }),
    );

    return data?.result?.message?.content;
  }
}
