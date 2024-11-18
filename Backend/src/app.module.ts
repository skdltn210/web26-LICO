import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { VideosModule } from './videos/videos.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { LivesModule } from './lives/lives.module';
import { ChatsModule } from './chats/chats.module';
import { FollowModule } from './follow/follow.module';
import sqliteConfig from './config/sqlite.config';
import mysqlConfig from './config/mysql.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { redisConfig } from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mysqlConfig, sqliteConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => typeOrmConfig(configService),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => redisConfig(configService),
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    VideosModule,
    LivesModule,
    ChatsModule,
    FollowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
