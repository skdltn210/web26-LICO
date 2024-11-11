import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';
import { UpdateLiveDto } from './dto/update.live.dto';
import { UUID } from 'crypto';

@Controller('lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  @Get()
  async getLives(): Promise<LivesDto[]> {
    return await this.livesService.readLives();
  }

  @Get('/:channelId')
  async getLive(@Param('channelId') channelId: UUID): Promise<LiveDto> {
    return await this.livesService.readLive(channelId);
  }

  @Patch('/:channelId')
  @HttpCode(204)
  async setLive(@Param('channelId') channelId: UUID, @Body(ValidationPipe) updateLiveDto: UpdateLiveDto) {
    await this.livesService.updateLive({ channelId, updateLiveDto });
  }

  @Get('/channel-id/:streamingKey')
  async getChannelId(@Param('streamingKey') streamingKey: UUID) {
    return await this.livesService.readChannelId(streamingKey);
  }

  @Post('/onair/:streamingKey')
  @HttpCode(204)
  async startLive(@Param('streamingKey') streamingKey: UUID) {
    await this.livesService.startLive(streamingKey);
  }

  @Delete('/onair/:streamingKey')
  @HttpCode(202)
  async endLive(@Param('streamingKey') streamingKey: UUID) {
    this.livesService.endLive(streamingKey);
  }
}
