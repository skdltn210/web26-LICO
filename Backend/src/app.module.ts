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
import { UserEntity } from './users/entity/user.entity';
import { LiveEntity } from './lives/entity/live.entity';
import sqliteConfig from './config/sqlite.config';
import mysqlConfig from './config/mysql.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mysqlConfig, sqliteConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...(await typeOrmConfig(configService)),
        entities: [UserEntity, LiveEntity], // 엔티티 명시적 추가
        autoLoadEntities: true, // 자동 엔티티 로드 활성화
      }),
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    VideosModule,
    LivesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
