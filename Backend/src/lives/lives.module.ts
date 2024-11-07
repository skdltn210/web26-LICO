import { Module } from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesController } from './lives.controller';
import { LiveEntity } from './entity/live.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LiveEntity])],
  providers: [LivesService],
  controllers: [LivesController],
})
export class LivesModule {}
