import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisConfig } from 'src/config/redis.config';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => redisConfig(configService),
    }),
  ],
  providers: [ChatsGateway, ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
