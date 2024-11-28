import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatsGateway } from './chats.gateway';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ChatsController } from './chats.controller';
import { redisConfig } from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => redisConfig(configService),
    }),
  ],
  providers: [ChatsGateway],
  controllers: [ChatsController],
})
export class ChatsModule {}
