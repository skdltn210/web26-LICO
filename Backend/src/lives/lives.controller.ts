import { Body, Controller, Get, HttpCode, Param, Patch, ValidationPipe } from '@nestjs/common';
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
  async setLive(@Param('channelId') channelId: UUID, @Body(ValidationPipe) updateLiveDto: UpdateLiveDto) {
    await this.livesService.updateLive({ channelId, updateLiveDto });
  }

  @Get('/channel-id/:streamingKey')
  async getChannelId(@Param('streamingKey') streamingKey: UUID) {
    return await this.livesService.readChannelId(streamingKey);
  }
}
