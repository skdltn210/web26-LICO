import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatsService } from './chats.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { JwtModule } from '@nestjs/jwt';
import { ChatsController } from './chats.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    RedisModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ChatsService],
  exports: [ChatsService],
  controllers: [ChatsController],
})
export class ChatsModule {}
