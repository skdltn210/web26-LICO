import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { StreamingModule } from './streaming/streaming.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [AuthModule, UsersModule, CategoriesModule, StreamingModule, VideosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
